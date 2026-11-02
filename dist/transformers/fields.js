import { z } from 'zod';
import { functionSchema } from '../schemas.js';
export const dtypeSchema = z.custom(value => typeof value === 'string' && value !== '', 'expected a dtype name');
export const deviceSchema = z.custom(value => typeof value === 'string' && value !== '', 'expected a device name');
// Annotated: declaration emit cannot name the peer's internal path for this type otherwise.
export const progressCallbackSchema = functionSchema();
//# sourceMappingURL=fields.js.map