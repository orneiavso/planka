const net = require('net');

// Cloud instance metadata endpoints are never a legitimate webhook target.
const METADATA_HOSTS = new Set(['169.254.169.254', 'fd00:ec2::254']);

function isPrivateIpv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return false;
  }

  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) {
    return true;
  }
  if (a === 169 && b === 254) {
    return true;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }
  if (a === 192 && b === 168) {
    return true;
  }

  return false;
}

function isPrivateIpv6(ip) {
  const value = ip.toLowerCase();
  if (value === '::1') {
    return true;
  }
  if (value.startsWith('fe80')) {
    return true;
  }
  if (value.startsWith('fc') || value.startsWith('fd')) {
    return true;
  }
  if (value.startsWith('::ffff:')) {
    return isPrivateIpv4(value.split(':').pop());
  }

  return false;
}

// Basic SSRF guard for outbound webhook calls: only http(s), never cloud
// metadata, and (unless explicitly allowed) no private/loopback/link-local IP
// literals. DNS names are not resolved here - full anti-rebinding resolution is
// tracked for a later iteration.
function isSafeWebhookUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch (error) {
    return false;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }

  const host = url.hostname.replace(/^\[/, '').replace(/\]$/, '');
  if (METADATA_HOSTS.has(host)) {
    return false;
  }

  if (process.env.WEBHOOKS_ALLOW_PRIVATE_TARGETS !== 'true') {
    if (net.isIPv4(host) && isPrivateIpv4(host)) {
      return false;
    }
    if (net.isIPv6(host) && isPrivateIpv6(host)) {
      return false;
    }
  }

  return true;
}

const EVENT_TYPES = {
  ACTION_CREATE: 'actionCreate',
  ACTION_DELETE: 'actionDelete',
  ACTION_UPDATE: 'actionUpdate',

  ATTACHMENT_CREATE: 'attachmentCreate',
  ATTACHMENT_DELETE: 'attachmentDelete',
  ATTACHMENT_UPDATE: 'attachmentUpdate',

  BOARD_CREATE: 'boardCreate',
  BOARD_DELETE: 'boardDelete',
  BOARD_UPDATE: 'boardUpdate',

  BOARD_MEMBERSHIP_CREATE: 'boardMembershipCreate',
  BOARD_MEMBERSHIP_DELETE: 'boardMembershipDelete',
  BOARD_MEMBERSHIP_UPDATE: 'boardMembershipUpdate',

  CARD_CREATE: 'cardCreate',
  CARD_DELETE: 'cardDelete',
  CARD_UPDATE: 'cardUpdate',

  CARD_LABEL_CREATE: 'cardLabelCreate',
  CARD_LABEL_DELETE: 'cardLabelDelete',

  CARD_MEMBERSHIP_CREATE: 'cardMembershipCreate',
  CARD_MEMBERSHIP_DELETE: 'cardMembershipDelete',

  LABEL_CREATE: 'labelCreate',
  LABEL_DELETE: 'labelDelete',
  LABEL_UPDATE: 'labelUpdate',

  LIST_CREATE: 'listCreate',
  LIST_DELETE: 'listDelete',
  LIST_SORT: 'listSort',
  LIST_UPDATE: 'listUpdate',

  NOTIFICATION_CREATE: 'notificationCreate',
  NOTIFICATION_UPDATE: 'notificationUpdate',

  PROJECT_CREATE: 'projectCreate',
  PROJECT_DELETE: 'projectDelete',
  PROJECT_UPDATE: 'projectUpdate',

  PROJECT_MANAGER_CREATE: 'projectManagerCreate',
  PROJECT_MANAGER_DELETE: 'projectManagerDelete',

  TASK_CREATE: 'taskCreate',
  TASK_DELETE: 'taskDelete',
  TASK_UPDATE: 'taskUpdate',

  USER_CREATE: 'userCreate',
  USER_DELETE: 'userDelete',
  USER_UPDATE: 'userUpdate',
};

const jsonifyData = (data) => {
  const nextData = {};

  if (data.item) {
    nextData.item = sails.helpers.utils.jsonifyRecord(data.item);
  }

  if (data.items) {
    nextData.items = data.items.map((item) => sails.helpers.utils.jsonifyRecord(item));
  }

  if (data.included) {
    nextData.included = Object.entries(data.included).reduce(
      (result, [key, items]) => ({
        ...result,
        [key]: items.map((item) => sails.helpers.utils.jsonifyRecord(item)),
      }),
      {},
    );
  }

  return nextData;
};

/**
 * @typedef {Object} Included
 * @property {any[]} [projects] - Array of projects (optional).
 * @property {any[]} [boards] - Array of boards (optional).
 * @property {any[]} [lists] - Array of lists (optional).
 * @property {any[]} [cards] - Array of cards (optional).
 */

/**
 * @typedef {Object} Data
 * @property {any} item - Actual event data.
 * @property {Included} [included] - Optional included data.
 */

/**
 * Sends a webhook notification to a configured URL.
 *
 * @param {*} webhook - Webhook configuration.
 * @param {string} event - The event (see {@link EVENT_TYPES}).
 * @param {Data} data - The data object containing event data and optionally included data.
 * @param {Data} [prevData] - The data object containing previous state of data (optional).
 * @param {ref} user - User object associated with the event.
 * @returns {Promise<void>}
 */
async function sendWebhook(webhook, event, data, prevData, user) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': `planka (+${sails.config.custom.baseUrl})`,
  };

  if (webhook.accessToken) {
    headers.Authorization = `Bearer ${webhook.accessToken}`;
  }

  const body = JSON.stringify({
    event,
    data: jsonifyData(data),
    prevData: prevData && jsonifyData(prevData),
    user: sails.helpers.utils.jsonifyRecord(user),
  });

  try {
    const response = await fetch(webhook.url, {
      headers,
      body,
      method: 'POST',
    });

    if (!response.ok) {
      const message = await response.text();

      sails.log.error(
        `Webhook ${webhook.url} failed with status ${response.status} and message: ${message}`,
      );
    }
  } catch (error) {
    sails.log.error(`Webhook ${webhook.url} failed with error: ${error}`);
  }
}

module.exports = {
  sync: true,

  inputs: {
    event: {
      type: 'string',
      required: true,
      isIn: Object.values(EVENT_TYPES),
    },
    data: {
      type: 'ref',
      required: true,
    },
    prevData: {
      type: 'ref',
    },
    user: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    if (!sails.config.custom.webhooks) {
      return;
    }

    sails.config.custom.webhooks.forEach((webhook) => {
      if (!webhook.url) {
        return;
      }

      if (!isSafeWebhookUrl(webhook.url)) {
        sails.log.warn(`Webhook skipped: blocked or unsafe URL (${webhook.url})`);
        return;
      }

      if (webhook.excludedEvents && webhook.excludedEvents.includes(inputs.event)) {
        return;
      }

      if (webhook.events && !webhook.events.includes(inputs.event)) {
        return;
      }

      sendWebhook(webhook, inputs.event, inputs.data, inputs.prevData, inputs.user);
    });
  },
};
