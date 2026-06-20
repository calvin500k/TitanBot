import { logger } from '../utils/logger.js';

// =========================================================================
// HELPERS INTERNES
// =========================================================================

/** Regex stricte pour valider un code couleur hexadécimal (#RGB ou #RRGGBB). */
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/**
 * Vérifie qu'une chaîne est bien un code couleur hexadécimal valide.
 * @param {unknown} value
 * @returns {boolean}
 */
function isValidHexColor(value) {
  return typeof value === "string" && HEX_COLOR_REGEX.test(value);
}

/**
 * Transforme une variable d'environnement "id1,id2,id3" en tableau d'IDs propre.
 * Filtre les entrées vides issues d'espaces ou de virgules en trop.
 * @param {string | undefined} value
 * @returns {string[]}
 */
function parseIdList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

/**
 * Parse une variable d'environnement booléenne ("true"/"1" => true).
 * @param {string | undefined} value
 * @param {boolean} fallback
 * @returns {boolean}
 */
function parseBoolEnv(value, fallback) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

/**
 * Parse une variable d'environnement numérique avec garde-fou contre NaN.
 * @param {string | undefined} value
 * @param {number} fallback
 * @returns {number}
 */
function parseIntEnv(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// =========================================================================
// CONFIGURATION PRINCIPALE
// =========================================================================

export const botConfig = {
  // =========================
  // BOT PRESENCE (ce que les utilisateurs voient sous le nom du bot)
  // =========================
  presence: {
    // "online" | "idle" | "dnd" | "invisible"
    status: "online",

    // Lignes d'activité affichées sous le nom du bot.
    // Mapping `type` Discord : 0=Playing, 1=Streaming, 2=Listening,
    // 3=Watching, 4=Custom, 5=Competing.
    activities: [
      {
        name: "Intel-FIND",
        type: 0,
      },
    ],
  },

  // =========================
  // COMPORTEMENT DES COMMANDES
  // =========================
  commands: {
    // IDs des owners du bot (variable d'env OWNER_IDS séparée par des virgules).
    owners: parseIdList(process.env.OWNER_IDS),

    // Temps d'attente par défaut entre deux usages d'une commande (secondes).
    defaultCooldown: parseIntEnv(process.env.DEFAULT_COOLDOWN, 3),

    // Si true, les anciennes commandes sont supprimées avant ré-enregistrement.
    deleteCommands: parseBoolEnv(process.env.DELETE_COMMANDS, false),

    // ID de serveur optionnel pour tester les slash commands rapidement.
    testGuildId: process.env.TEST_GUILD_ID || null,

    // Préfixe pour les commandes textuelles (ex: "!" pour "!ping").
    prefix: process.env.PREFIX || "!",
  },

  // =========================
  // SYSTÈME DE CANDIDATURES
  // =========================
  applications: {
    defaultQuestions: [
      { question: "What is your name?", required: true },
      { question: "How old are you?", required: true },
      { question: "Why do you want to join?", required: true },
    ],

    statusColors: {
      pending: "#FFA500",
      approved: "#00FF00",
      denied: "#FF0000",
    },

    // Délai avant qu'un utilisateur puisse soumettre une nouvelle candidature (heures).
    applicationCooldown: 24,

    // Suppression automatique des candidatures refusées après X jours.
    deleteDeniedAfter: 7,

    // Suppression automatique des candidatures approuvées après X jours.
    deleteApprovedAfter: 30,

    // IDs des rôles autorisés à gérer les candidatures.
    managerRoles: parseIdList(process.env.APPLICATION_MANAGER_ROLES),
  },

  // =========================
  // COULEURS DES EMBEDS & BRANDING
  // =========================
  // IMPORTANT : c'est la SOURCE UNIQUE DE VÉRITÉ pour toutes les couleurs du bot.
  embeds: {
    colors: {
      primary: "#336699",
      secondary: "#2F3136",

      success: "#57F287",
      error: "#ED4245",
      warning: "#FEE75C",
      info: "#3498DB",

      light: "#FFFFFF",
      dark: "#202225",
      gray: "#99AAB5",

      blurple: "#5865F2",
      green: "#57F287",
      yellow: "#FEE75C",
      fuchsia: "#EB459E",
      red: "#ED4245",
      black: "#000000",

      giveaway: {
        active: "#57F287",
        ended: "#ED4245",
      },
      ticket: {
        open: "#57F287",
        claimed: "#FAA61A",
        closed: "#ED4245",
        pending: "#99AAB5",
      },
      economy: "#F1C40F",
      birthday: "#E91E63",
      moderation: "#9B59B6",

      priority: {
        none: "#95A5A6",
        low: "#3498db",
        medium: "#2ecc71",
        high: "#f1c40f",
        urgent: "#e74c3c",
      },
    },
    footer: {
      text: "Titan Bot",
      icon: null,
    },
    thumbnail: null,
    author: {
      name: null,
      icon: null,
      url: null,
    },
  },

  // =========================
  // PARAMÈTRES DE L'ÉCONOMIE
  // =========================
  economy: {
    currency: {
      name: "coins",
      namePlural: "coins",
      symbol: "$",
    },

    startingBalance: 0,
    baseBankCapacity: 100000,
    dailyAmount: 100,

    workMin: 10,
    workMax: 100,

    begMin: 5,
    begMax: 50,

    // Chance de réussite d'un vol (0.4 = 40%).
    robSuccessRate: 0.4,

    // Temps en prison après un vol échoué (millisecondes). 3600000 = 1h.
    robFailJailTime: 3600000,
  },

  // =========================
  // PARAMÈTRES DE LA BOUTIQUE
  // =========================
  shop: {
    // À compléter selon les besoins futurs.
  },

  // =========================
  // SYSTÈME DE TICKETS
  // =========================
  tickets: {
    // ID de catégorie où les nouveaux tickets sont créés (null = pas forcé).
    defaultCategory: null,

    // IDs des rôles autorisés à gérer/supporter les tickets.
    supportRoles: parseIdList(process.env.TICKET_SUPPORT_ROLES),

    priorities: {
      none: { emoji: "⚪", color: "#95A5A6", label: "None" },
      low: { emoji: "🟢", color: "#2ECC71", label: "Low" },
      medium: { emoji: "🟡", color: "#F1C40F", label: "Medium" },
      high: { emoji: "🔴", color: "#E74C3C", label: "High" },
      urgent: { emoji: "🚨", color: "#E91E63", label: "Urgent" },
    },

    defaultPriority: "none",

    // ID de catégorie où les tickets fermés sont archivés.
    archiveCategory: null,

    // ID du canal où les logs de tickets sont envoyés.
    logChannel: null,
  },

  // =========================
  // PARAMÈTRES DES GIVEAWAYS
  // =========================
  giveaways: {
    // Durée par défaut d'un giveaway (millisecondes). 86400000 = 24h.
    defaultDuration: 86400000,

    minimumWinners: 1,
    maximumWinners: 10,

    // 300000 = 5 minutes.
    minimumDuration: 300000,
    // 2592000000 = 30 jours.
    maximumDuration: 2592000000,

    // IDs des rôles autorisés à organiser des giveaways.
    allowedRoles: parseIdList(process.env.GIVEAWAY_ALLOWED_ROLES),

    // IDs des rôles qui contournent les restrictions de giveaway.
    bypassRoles: parseIdList(process.env.GIVEAWAY_BYPASS_ROLES),
  },

  // =========================
  // PARAMÈTRES D'ANNIVERSAIRE
  // =========================
  birthday: {
    // ID du rôle donné aux utilisateurs le jour de leur anniversaire.
    defaultRole: null,

    // ID du canal où les annonces d'anniversaire sont postées.
    announcementChannel: null,

    // Fuseau horaire utilisé pour calculer les dates d'anniversaire.
    timezone: "UTC",
  },

  // =========================
  // PARAMÈTRES DE VÉRIFICATION
  // =========================
  verification: {
    defaultMessage:
      "Click the button below to verify yourself and gain access to the server!",
    defaultButtonText: "Verify",

    autoVerify: {
      // "none" | "account_age" | "server_size"
      defaultCriteria: "none",

      // Jours utilisés quand `defaultCriteria` est "account_age".
      defaultAccountAgeDays: 7,

      // Seuil de membres utilisé quand `defaultCriteria` est "server_size".
      serverSizeThreshold: 1000,

      // Limites de sécurité autorisées pour les exigences d'âge de compte.
      minAccountAge: 1,
      maxAccountAge: 365,

      // Si true, l'utilisateur reçoit un DM après vérification.
      sendDMNotification: true,

      // Descriptions lisibles pour chaque mode de critère.
      criteria: {
        account_age: "Account must be older than specified days",
        server_size: "All users if server has less than 1000 members",
        none: "All users immediately",
      },
    },

    // Temps minimum entre deux tentatives de vérification (ms). 5000 = 5s.
    verificationCooldown: 5000,

    // Nombre maximal de tentatives échouées dans la fenêtre ci-dessous.
    maxVerificationAttempts: 3,

    // Fenêtre de temps pour compter les tentatives (ms). 60000 = 1 min.
    attemptWindow: 60000,

    // Limites de sécurité en mémoire (évite une croissance mémoire illimitée).
    maxCooldownEntries: 10000,
    maxAttemptEntries: 10000,
    // Fréquence de nettoyage des maps de cooldown/tentatives (ms). 300000 = 5 min.
    cooldownCleanupInterval: 300000,
    // Taille maximale du payload de métadonnées pour les entrées d'audit (octets).
    maxAuditMetadataBytes: 4096,
    // Nombre maximal d'entrées d'audit conservées en mémoire.
    maxInMemoryAuditEntries: 1000,
    // Si true, journalise chaque action de vérification.
    logAllVerifications: true,
    // Si true, conserve l'historique d'audit de vérification.
    keepAuditTrail: true,
  },

  // =========================
  // MESSAGES DE BIENVENUE / DÉPART
  // =========================
  welcome: {
    // Placeholders : {user}, {server}, {memberCount}
    defaultWelcomeMessage:
      "Welcome {user} to {server}! We now have {memberCount} members!",
    // Placeholders : {user}, {memberCount}
    defaultGoodbyeMessage:
      "{user} has left the server. We now have {memberCount} members.",
    defaultWelcomeChannel: null,
    defaultGoodbyeChannel: null,
  },

  // =========================
  // CANAUX COMPTEURS
  // =========================
  counters: {
    defaults: {
      name: "{name} Counter",
      description: "Server {name} counter",
      type: "voice",
      channelName: "{name}-{count}",
    },
    permissions: {
      deny: ["VIEW_CHANNEL"],
      allow: ["VIEW_CHANNEL", "CONNECT", "SPEAK"],
    },
    messages: {
      created: "✅ Created counter **{name}**",
      deleted: "🗑️ Deleted counter **{name}**",
      updated: "🔄 Updated counter **{name}**",
    },
    types: {
      members: {
        name: "👥 Members",
        description: "Total members in the server",
        getCount: (guild) => guild.memberCount.toString(),
      },
      bots: {
        name: "🤖 Bots",
        description: "Total bot accounts in the server",
        getCount: (guild) =>
          guild.members.cache.filter((m) => m.user.bot).size.toString(),
      },
      members_only: {
        name: "👤 Humans",
        description: "Total human members (non-bots)",
        getCount: (guild) =>
          guild.members.cache.filter((m) => !m.user.bot).size.toString(),
      },
    },
  },

  // =========================
  // MESSAGES GÉNÉRIQUES DU BOT
  // =========================
  messages: {
    noPermission: "You do not have permission to use this command.",
    cooldownActive: "Please wait {time} before using this command again.",
    errorOccurred: "An error occurred while executing this command.",
    missingPermissions:
      "I am missing required permissions to perform this action.",
    commandDisabled: "This command has been disabled.",
    maintenanceMode: "The bot is currently in maintenance mode.",
  },

  // =========================
  // FEATURE TOGGLES
  // =========================
  // Mettre une fonctionnalité à `false` la désactive globalement.
  features: {
    economy: true,
    leveling: true,
    moderation: true,
    logging: true,
    welcome: true,

    tickets: true,
    giveaways: true,
    birthday: true,
    counter: true,

    verification: true,
    reactionRoles: true,
    joinToCreate: true,

    voice: true,
    search: true,
    tools: true,
    utility: true,
    community: true,
    fun: true,
  },
};

// =========================================================================
// VALIDATION DE LA CONFIGURATION
// =========================================================================

/**
 * Valide une configuration de bot : variables d'environnement requises
 * et cohérence interne (couleurs, plages numériques, etc.).
 * @param {typeof botConfig} config
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateConfig(config) {
  const errors = [];
  const warnings = [];

  if (process.env.NODE_ENV !== "production") {
    logger.debug("Environment variables check:", {
      DISCORD_TOKEN: !!process.env.DISCORD_TOKEN,
      TOKEN: !!process.env.TOKEN,
      CLIENT_ID: !!process.env.CLIENT_ID,
      GUILD_ID: !!process.env.GUILD_ID,
      POSTGRES_HOST: !!process.env.POSTGRES_HOST,
      NODE_ENV: process.env.NODE_ENV,
    });
  }

  // --- Variables d'environnement requises ---
  if (!process.env.DISCORD_TOKEN && !process.env.TOKEN) {
    errors.push(
      "Bot token is required (DISCORD_TOKEN or TOKEN environment variable)",
    );
  }

  if (!process.env.CLIENT_ID) {
    errors.push("Client ID is required (CLIENT_ID environment variable)");
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.POSTGRES_HOST) {
      errors.push(
        "PostgreSQL host is required in production (POSTGRES_HOST environment variable)",
      );
    }
    if (!process.env.POSTGRES_USER) {
      errors.push(
        "PostgreSQL user is required in production (POSTGRES_USER environment variable)",
      );
    }
    if (!process.env.POSTGRES_PASSWORD) {
      errors.push(
        "PostgreSQL password is required in production (POSTGRES_PASSWORD environment variable)",
      );
    }
  }

  // --- Cohérence interne de la config ---
  // Toutes les couleurs déclarées doivent être des hex valides.
  const colorIssues = collectInvalidColors(config.embeds.colors, "embeds.colors");
  errors.push(...colorIssues);

  // Plages économiques cohérentes.
  if (config.economy.workMin > config.economy.workMax) {
    errors.push("economy.workMin cannot be greater than economy.workMax");
  }
  if (config.economy.begMin > config.economy.begMax) {
    errors.push("economy.begMin cannot be greater than economy.begMax");
  }
  if (config.economy.robSuccessRate < 0 || config.economy.robSuccessRate > 1) {
    errors.push("economy.robSuccessRate must be between 0 and 1");
  }

  // Plages de giveaways cohérentes.
  if (config.giveaways.minimumWinners > config.giveaways.maximumWinners) {
    errors.push(
      "giveaways.minimumWinners cannot be greater than giveaways.maximumWinners",
    );
  }
  if (config.giveaways.minimumDuration > config.giveaways.maximumDuration) {
    errors.push(
      "giveaways.minimumDuration cannot be greater than giveaways.maximumDuration",
    );
  }

  // Vérification : la priorité par défaut des tickets doit exister.
  if (!config.tickets.priorities[config.tickets.defaultPriority]) {
    errors.push(
      `tickets.defaultPriority "${config.tickets.defaultPriority}" does not match any entry in tickets.priorities`,
    );
  }

  // Vérification : le critère d'auto-vérification par défaut doit exister.
  if (
    !config.verification.autoVerify.criteria[
      config.verification.autoVerify.defaultCriteria
    ]
  ) {
    errors.push(
      `verification.autoVerify.defaultCriteria "${config.verification.autoVerify.defaultCriteria}" does not match any entry in verification.autoVerify.criteria`,
    );
  }
  if (
    config.verification.autoVerify.defaultAccountAgeDays <
      config.verification.autoVerify.minAccountAge ||
    config.verification.autoVerify.defaultAccountAgeDays >
      config.verification.autoVerify.maxAccountAge
  ) {
    warnings.push(
      "verification.autoVerify.defaultAccountAgeDays is outside the min/max account age bounds",
    );
  }

  return { errors, warnings };
}

/**
 * Parcourt récursivement un objet de couleurs et collecte les valeurs
 * qui ne sont pas des codes hexadécimaux valides.
 * @param {Record<string, unknown>} colors
 * @param {string} pathPrefix
 * @returns {string[]}
 */
function collectInvalidColors(colors, pathPrefix) {
  const issues = [];
  for (const [key, value] of Object.entries(colors)) {
    const path = `${pathPrefix}.${key}`;
    if (typeof value === "string") {
      if (!isValidHexColor(value)) {
        issues.push(`Invalid hex color at ${path}: "${value}"`);
      }
    } else if (value && typeof value === "object") {
      issues.push(...collectInvalidColors(value, path));
    }
  }
  return issues;
}

// Exécute la validation au chargement du module.
const { errors: configErrors, warnings: configWarnings } =
  validateConfig(botConfig);

if (configWarnings.length > 0) {
  logger.warn("Bot configuration warnings:\n" + configWarnings.join("\n"));
}

if (configErrors.length > 0) {
  logger.error("Bot configuration errors:\n" + configErrors.join("\n"));
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

export const BotConfig = botConfig;

// =========================================================================
// HELPERS DE COULEUR
// =========================================================================

/**
 * Résout un chemin de couleur (ex: "ticket.open" ou "#FF0000") vers
 * un entier compatible avec l'API Discord (ColorResolvable numérique).
 *
 * @param {string | number} path Chemin pointé dans `embeds.colors`, ou code hex direct.
 * @param {string} [fallback] Couleur hex de repli si le chemin est introuvable.
 * @returns {number} Couleur sous forme d'entier.
 */
export function getColor(path, fallback = "#99AAB5") {
  if (typeof path === "number") return path;

  if (typeof path !== "string") {
    logger.warn(`getColor() received an unexpected type: ${typeof path}`);
    return hexToInt(fallback);
  }

  if (isValidHexColor(path)) {
    return hexToInt(path);
  }

  const result = path
    .split(".")
    .reduce(
      (obj, key) =>
        obj && obj[key] !== undefined ? obj[key] : undefined,
      botConfig.embeds.colors,
    );

  if (result === undefined) {
    logger.warn(`getColor(): no color found at path "${path}", using fallback`);
    return hexToInt(fallback);
  }

  if (isValidHexColor(result)) {
    return hexToInt(result);
  }

  // Le chemin pointait vers un objet (catégorie) plutôt qu'une couleur finale.
  logger.warn(
    `getColor(): path "${path}" did not resolve to a color string, using fallback`,
  );
  return hexToInt(fallback);
}

/**
 * Convertit un code hexadécimal "#RRGGBB" en entier.
 * @param {string} hex
 * @returns {number}
 */
function hexToInt(hex) {
  return parseInt(hex.replace("#", ""), 16);
}

/**
 * Aplati récursivement toutes les couleurs valides de `embeds.colors`
 * en une simple liste de codes hex.
 * @param {Record<string, unknown>} [colors]
 * @returns {string[]}
 */
function flattenColors(colors = botConfig.embeds.colors) {
  const flat = [];
  for (const value of Object.values(colors)) {
    if (typeof value === "string" && isValidHexColor(value)) {
      flat.push(value);
    } else if (value && typeof value === "object") {
      flat.push(...flattenColors(value));
    }
  }
  return flat;
}

/**
 * Retourne une couleur aléatoire parmi toutes celles définies dans `embeds.colors`.
 * @returns {string} Code hexadécimal (ex: "#5865F2").
 */
export function getRandomColor() {
  const colors = flattenColors();
  if (colors.length === 0) return "#99AAB5";
  return colors[Math.floor(Math.random() * colors.length)];
}

export default botConfig;
