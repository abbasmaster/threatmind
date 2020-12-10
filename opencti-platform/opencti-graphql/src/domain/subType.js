import { querySubTypes, queryAttributes } from '../database/grakn';

export const findAll = (args) => querySubTypes(args);

export const findAttributes = (args) => queryAttributes(args.type);
