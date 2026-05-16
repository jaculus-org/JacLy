import * as chai from 'chai';
import 'mocha';
import { ConsoleBusService } from '../../src/console/services/console-bus-service';

const expect = chai.expect;

describe('ConsoleBusService', () => {
  it('appends an entry to a channel and notifies subscribers', () => {
    const bus = new ConsoleBusService();
    const received: unknown[] = [];
    bus.subscribe('test', (entries) => received.push(entries));

    bus.append('test', 'out', 'Hello');

    expect(received).to.have.lengthOf(2);
    expect(received[1]).to.have.lengthOf(1);
    expect((received[1] as Array<{ content: string; type: string }>)[0].content).to.equal('Hello');
    expect((received[1] as Array<{ content: string; type: string }>)[0].type).to.equal('out');
  });

  it('subscribe callback receives the current state immediately', () => {
    const bus = new ConsoleBusService();
    bus.append('ch', 'out', 'first');

    const received: unknown[] = [];
    bus.subscribe('ch', (entries) => received.push(entries));

    expect(received).to.have.lengthOf(1);
    expect(received[0]).to.have.lengthOf(1);
    expect((received[0] as Array<{ content: string }>)[0].content).to.equal('first');
  });

  it('clear empties a channel and notifies subscribers', () => {
    const bus = new ConsoleBusService();
    bus.append('ch', 'out', 'one');

    const received: unknown[] = [];
    bus.subscribe('ch', (entries) => received.push(entries));

    bus.clear('ch');

    expect(received[1]).to.have.lengthOf(0);
  });

  it('removeLastEntry removes the final entry', () => {
    const bus = new ConsoleBusService();
    bus.append('ch', 'out', 'one');
    bus.append('ch', 'out', 'two');
    bus.append('ch', 'out', 'three');

    bus.removeLastEntry('ch');

    const received: unknown[] = [];
    bus.subscribe('ch', (entries) => received.push(entries));

    expect(received[0]).to.have.lengthOf(2);
    expect((received[0] as Array<{ content: string }>)[0].content).to.equal('one');
    expect((received[0] as Array<{ content: string }>)[1].content).to.equal('two');
  });

  it('removeLastEntry does nothing on an empty channel', () => {
    const bus = new ConsoleBusService();
    bus.removeLastEntry('ch');

    const received: unknown[] = [];
    bus.subscribe('ch', (entries) => received.push(entries));

    expect(received[0]).to.have.lengthOf(0);
  });

  it('caps entries at maxEntriesPerChannel', () => {
    const bus = new ConsoleBusService(3);
    bus.append('ch', 'out', 'a');
    bus.append('ch', 'out', 'b');
    bus.append('ch', 'out', 'c');
    bus.append('ch', 'out', 'd');

    const received: unknown[] = [];
    bus.subscribe('ch', (entries) => received.push(entries));

    expect(received[0]).to.have.lengthOf(3);
    expect((received[0] as Array<{ content: string }>)[0].content).to.equal('b');
    expect((received[0] as Array<{ content: string }>)[2].content).to.equal('d');
  });

  it('unsubscribes from channel updates', () => {
    const bus = new ConsoleBusService();
    const received: unknown[] = [];
    const unsubscribe = bus.subscribe('ch', (entries) => received.push(entries));

    unsubscribe();
    bus.append('ch', 'out', 'one');

    expect(received).to.have.lengthOf(1);
  });

  it('isolates channels from each other', () => {
    const bus = new ConsoleBusService();
    const ch1: unknown[] = [];
    const ch2: unknown[] = [];
    bus.subscribe('ch1', (e) => ch1.push(e));
    bus.subscribe('ch2', (e) => ch2.push(e));

    bus.append('ch1', 'out', 'hello');

    expect(ch1).to.have.lengthOf(2);
    expect(ch2).to.have.lengthOf(1);
  });
});
