import * as chai from 'chai';
import 'mocha';
import { JaclyConfigSchema } from '../../src/schema';

const expect = chai.expect;

describe('JaclyConfigSchema', () => {
  it('accepts chained next blocks inside block contents', () => {
    const result = JaclyConfigSchema.safeParse({
      category: 'example',
      name: 'Example',
      contents: [
        {
          kind: 'block',
          type: 'first_block',
          args0: [
            {
              name: 'VALUE',
              type: 'input_value',
              block: {
                type: 'second_block',
                next: {
                  block: {
                    type: 'third_block',
                  },
                },
              },
            },
          ],
        },
      ],
    });

    expect(result.success).to.equal(true);
    if (!result.success) {
      throw new Error(result.error.message);
    }

    expect(result.data.contents?.[0]).to.have.nested.property(
      'args0[0].block.next.block.type',
      'third_block',
    );
  });

  it('accepts a joined top-level next block definition', () => {
    const result = JaclyConfigSchema.safeParse({
      category: 'example',
      name: 'Example',
      contents: [
        {
          kind: 'block',
          type: 'first_block',
          next: {
            block: {
              kind: 'block',
              type: 'second_block',
            },
          },
        },
      ],
    });

    expect(result.success).to.equal(true);
    if (!result.success) {
      throw new Error(result.error.message);
    }

    expect(result.data.contents?.[0]).to.have.nested.property('next.block.type', 'second_block');
  });
});
