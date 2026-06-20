import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('intel-find')
    .setDescription('Hello World'),

  async execute(interaction) {
    await interaction.reply('Hello World');
  },
};
