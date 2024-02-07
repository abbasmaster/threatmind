import { describe, expect, it, afterAll, beforeAll } from 'vitest';
import { testContext } from '../../utils/testQuery';
import { addMarkingDefinition, markingDefinitionDelete } from '../../../src/domain/markingDefinition';
import { cleanMarkingsForEditing, cleanMarkingsForReading, handleMarkingOperations } from '../../../src/utils/markingDefinition-utils';
import { SYSTEM_USER } from '../../../src/utils/access';
import { UPDATE_OPERATION_ADD, UPDATE_OPERATION_REMOVE, UPDATE_OPERATION_REPLACE } from '../../../src/database/utils';

const markings = [
  {
    type: 'marking-definition',
    spec_version: '2.1',
    definition_type: 'PAP',
    x_opencti_order: 1,
    x_opencti_color: '#ffffff',
    definition: 'PAP:CLEAR',
    created: '2020-02-25T09:02:29.040Z',
    modified: '2020-02-25T09:02:29.040Z'
  },
  {
    type: 'marking-definition',
    spec_version: '2.1',
    definition_type: 'PAP',
    x_opencti_order: 4,
    x_opencti_color: '#d62828',
    definition: 'PAP:RED',
    created: '2020-02-25T09:02:29.040Z',
    modified: '2020-02-25T09:02:29.040Z'
  },
  {
    type: 'marking-definition',
    spec_version: '2.1',
    definition_type: 'statement',
    x_opencti_order: 0,
    x_opencti_color: '#7da2e8',
    definition: 'cc-by-sa-4.0 disarm foundation',
    created: '2020-02-25T09:02:29.040Z',
    modified: '2020-02-25T09:02:29.040Z'
  },
  {
    type: 'marking-definition',
    spec_version: '2.1',
    definition_type: 'statement',
    x_opencti_order: 0,
    x_opencti_color: '#7da2e8',
    definition: 'Copyright 2020-2023, The MITRE Corporation. MITRE ATT&CK and ATT&CK are registered trademarks of The MITRE Corporation.',
    created: '2020-02-25T09:02:29.040Z',
    modified: '2020-02-25T09:02:29.040Z'
  },
];

const createMarking = async (marking) => {
  const { definition_type, definition, x_opencti_order, x_opencti_color } = marking;
  // Create the markingDefinition
  return await addMarkingDefinition(testContext, SYSTEM_USER, {
    definition_type,
    definition,
    x_opencti_color,
    x_opencti_order,
  });
};

let clearPAPMarking;
let redPAPMarking;
let statementMarking1;
let statementMarking2;
describe('Marking Definition', () => {
  beforeAll(async () => {
    clearPAPMarking = await createMarking(markings[0]);
    redPAPMarking = await createMarking(markings[1]);
    statementMarking1 = await createMarking(markings[2]);
    statementMarking2 = await createMarking(markings[3]);
  });
  describe('Clean Markings use for editing', async () => {
    it('Case add only one marking => output one marking added', async () => {
      const result = await cleanMarkingsForEditing(testContext, [clearPAPMarking]);
      expect(result.map((r) => r.id)).toEqual([clearPAPMarking.id]);
    });
    it('Case add 2 markings same type AND order different => output marking with higher rank added', async () => {
      // Case input 2 markings same type AND order different: output marking with higher rank added
      const result = await cleanMarkingsForEditing(testContext, [clearPAPMarking, redPAPMarking]);
      expect(result.map((r) => r.id)).toEqual([redPAPMarking.id]);
    });
    it('Case add 2 markings different type => output both markings added', async () => {
      const result = await cleanMarkingsForEditing(testContext, [clearPAPMarking, statementMarking1]);
      expect(result.map((r) => r.id)).toEqual([clearPAPMarking.id, statementMarking1.id]);
    });
    it('Case add 2 markings same type AND order different AND another type => output marking with higher rank added AND the other type', async () => {
      const result = await cleanMarkingsForEditing(testContext, [redPAPMarking, clearPAPMarking, statementMarking1]);
      expect(result.map((r) => r.id)).toEqual([redPAPMarking.id, statementMarking1.id]);
    });
  });

  describe('Clean Markings use for reading', async () => {
    it('Case add a marking with an an unknown id => output no marking added', async () => {
      const result = await cleanMarkingsForReading(testContext, ['unknown-id']);
      expect(result.map((r) => r.id)).toEqual([]);
    });
    it('Case add a marking with as undefined (deleted case) => output no marking added', async () => {
      const result = await cleanMarkingsForReading(testContext, [undefined]);
      expect(result.map((r) => r.id)).toEqual([]);
    });
  });

  describe('Markings to replace filtered', () => {
    describe('Case update operation ADD', () => {
      it('Add no markings', async () => {
        // PAP 01 + statement1 00 -> Add nothing => ADD nothing
        const result = await handleMarkingOperations(testContext, [statementMarking1, clearPAPMarking], [], UPDATE_OPERATION_ADD);
        expect(result).toEqual({ operation: 'add', refs: [] });
      });

      it('Case add 1 marking, current no marking => add 1 marking', async () => {
        // no markings -> Add PAP 01 => ADD PAP 01
        const result = await handleMarkingOperations(testContext, [], [clearPAPMarking], UPDATE_OPERATION_ADD);
        expect(result.operation).toEqual('add');
        expect(result.refs.map((r) => r.internal_id)).toEqual([clearPAPMarking.id]);
      });

      it('Case add 1 marking, current 1 has same type AND lower order => replace 1 marking', async () => {
        // PAP 01 -> Add PAP 04 => REPLACE PAP 04
        const result = await handleMarkingOperations(testContext, [clearPAPMarking], [redPAPMarking], UPDATE_OPERATION_ADD);
        expect(result.operation).toEqual('replace');
        expect(result.refs.map((r) => r.internal_id)).toEqual([redPAPMarking.id]);
      });

      it('Case add 1 marking, current 1 has same type AND same order => add marking', async () => {
        // statement1 00 -> Add statement2 00 => add statement2 00
        const result = await handleMarkingOperations(testContext, [statementMarking1], [statementMarking2], UPDATE_OPERATION_ADD);
        expect(result.operation).toEqual('add');
        expect(result.refs.map((r) => r.internal_id)).toEqual([statementMarking2.id]);
      });

      it('Case add 1 marking, current 1 has same type AND higher order => do nothing', async () => {
        // PAP 04 -> Add PAP 01 => Do nothing
        const result = await handleMarkingOperations(testContext, [redPAPMarking], [clearPAPMarking], UPDATE_OPERATION_ADD);
        expect(result).toEqual({ operation: 'add', refs: [] });
      });

      it('Case add 2 markings, current 1 has same type AND higher order + 1 different type => only add marking not in common', async () => {
        // PAP 04 -> Add PAP 01 => Add marking not in common only
        const result = await handleMarkingOperations(testContext, [redPAPMarking], [clearPAPMarking, statementMarking1], UPDATE_OPERATION_ADD);
        expect(result.operation).toEqual('add');
        expect(result.refs.map((r) => r.internal_id)).toEqual([statementMarking1.id]);
      });
    });

    describe('Case update operation UPDATE', () => {
      it('Replace with nothing => Remove all markings', async () => {
        // PAP 01 + statement1 00 -> Add nothing => Remove all
        const result = await handleMarkingOperations(testContext, [statementMarking1, clearPAPMarking], [], UPDATE_OPERATION_REPLACE);
        expect(result).toEqual({ operation: 'replace', refs: [] });
      });

      it('Case add 1 marking, current 1 marking => output replace 1 marking', async () => {
      // PAP 04 -> Add PAP 01 => REPLACE PAP 01
        const result = await handleMarkingOperations(testContext, [redPAPMarking], [clearPAPMarking], UPDATE_OPERATION_REPLACE);
        expect(result.operation).toEqual('replace');
        expect(result.refs.map((r) => r.internal_id)).toEqual([clearPAPMarking.id]);
      });

      it('Case add 1 marking, current 2 markings => output replace with 1 marking', async () => {
        // PAP 01 + statement1 00 -> Add PAP 04 => REPLACE PAP 04
        const result = await handleMarkingOperations(testContext, [clearPAPMarking, statementMarking1], [redPAPMarking], UPDATE_OPERATION_REPLACE);
        expect(result.operation).toEqual('replace');
        expect(result.refs.map((r) => r.internal_id)).toEqual([redPAPMarking.id]);
      });

      it('Case add 2 markings, current 1 marking => output replace by 2 markings', async () => {
        // PAP 01 -> Add statement1 00 + statement2 00 => ADD statement1 00 + statement2 00
        const result = await handleMarkingOperations(testContext, [clearPAPMarking], [statementMarking1, statementMarking2], UPDATE_OPERATION_REPLACE);
        expect(result.operation).toEqual('replace');
        expect(result.refs.map((r) => r.internal_id)).toEqual([statementMarking1.id, statementMarking2.id]);
      });
    });

    describe('Case update operation REMOVE', () => {
      it('Case remove 1 marking', async () => {
        const result = await handleMarkingOperations(testContext, [clearPAPMarking], [clearPAPMarking], UPDATE_OPERATION_REMOVE);
        expect(result.operation).toEqual('remove');
        expect(result.refs.map((r) => r.internal_id)).toEqual([clearPAPMarking.id]);
      });

      it('Case remove for all markings', async () => {
        const result = await handleMarkingOperations(testContext, [clearPAPMarking, statementMarking1], [clearPAPMarking, statementMarking2], UPDATE_OPERATION_REMOVE);
        expect(result.operation).toEqual('remove');
        expect(result.refs.map((r) => r.internal_id)).toEqual([clearPAPMarking.id, statementMarking2.id]);
      });
    });
  });

  afterAll(async () => {
    const createdMarkings = [clearPAPMarking, redPAPMarking, statementMarking1, statementMarking2];
    for (let i = 0; i < createdMarkings.length; i += 1) {
      const markingId = createdMarkings[i].id;
      // Create the markingDefinition
      await markingDefinitionDelete(testContext, SYSTEM_USER, markingId);
    }
  });
});
