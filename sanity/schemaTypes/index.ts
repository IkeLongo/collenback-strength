import { type SchemaTypeDefinition } from 'sanity'
import { service } from './serviceType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [service],
}
