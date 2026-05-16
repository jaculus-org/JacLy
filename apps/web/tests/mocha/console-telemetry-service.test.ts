import * as chai from 'chai';
import 'mocha';
import { ConsoleTelemetryService } from '../../src/console/services/console-telemetry-service';
import type { ConsoleEntry } from '../../src/console/types/types';

const expect = chai.expect;

function entry(type: ConsoleEntry['type'], content: string): ConsoleEntry {
  return { timestamp: new Date(), type, content };
}

describe('ConsoleTelemetryService', () => {
  const service = new ConsoleTelemetryService(60_000);

  it('createSnapshot returns empty state', () => {
    const snapshot = service.createSnapshot();
    expect(snapshot.historyEntries).to.deep.equal({});
    expect(snapshot.latestEntries).to.deep.equal({});
  });

  it('extractKeyValuePairs parses latest values', () => {
    const result = service.extractKeyValuePairs([entry('out', 'temp: 23.5')]);
    expect(result.temp).to.exist;
    expect(result.temp.value).to.equal(23.5);
  });

  it('extractKeyValueHistory returns history arrays', () => {
    const result = service.extractKeyValueHistory([entry('out', 'temp: 23.5; humidity: 60')]);
    expect(result.temp).to.have.lengthOf(1);
    expect(result.humidity).to.have.lengthOf(1);
    expect(result.temp[0].value).to.equal(23.5);
    expect(result.humidity[0].value).to.equal(60);
  });

  it('ignores entries that are not out or err', () => {
    const result = service.extractKeyValuePairs([
      entry('in', 'temp: 23.5'),
      entry('out', 'humidity: 60'),
    ]);
    expect(result.temp).to.not.exist;
    expect(result.humidity).to.exist;
  });

  it('appendTelemetry merges with existing snapshot', () => {
    const snapshot = service.extractTelemetry([entry('out', 'a: 1')]);
    const merged = service.appendTelemetry(snapshot, [entry('out', 'b: 2')]);

    expect(merged.latestEntries.a.value).to.equal(1);
    expect(merged.latestEntries.b.value).to.equal(2);
    expect(merged.historyEntries.a).to.have.lengthOf(1);
    expect(merged.historyEntries.b).to.have.lengthOf(1);
  });

  it('appendTelemetry with empty entries returns the same snapshot', () => {
    const snapshot = service.extractTelemetry([entry('out', 'x: 1')]);
    const result = service.appendTelemetry(snapshot, []);
    expect(result).to.equal(snapshot);
  });

  it('handles multiple key-value pairs on one line', () => {
    const result = service.extractKeyValuePairs([entry('out', 'x: 1; y: 2; z: 3')]);
    expect(result.x.value).to.equal(1);
    expect(result.y.value).to.equal(2);
    expect(result.z.value).to.equal(3);
  });

  it('handles float and negative values', () => {
    const result = service.extractKeyValuePairs([entry('out', 'temp: -5.5; ratio: 0.333')]);
    expect(result.temp.value).to.equal(-5.5);
    expect(result.ratio.value).to.equal(0.333);
  });
});
