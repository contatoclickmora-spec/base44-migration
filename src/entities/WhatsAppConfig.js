import { createEntity } from './base';

// WhatsAppConfig entity - mocked until table is created in Supabase
export const WhatsAppConfig = {
  ...createEntity('whatsapp_config'),
  // Mock methods for development
  async list() { return []; },
  async filter() { return []; },
  async get() { return null; },
  async create(data) { return { id: crypto.randomUUID(), ...data }; },
  async update(id, data) { return { id, ...data }; },
  async delete() { return true; }
};
