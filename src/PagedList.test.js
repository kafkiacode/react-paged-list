import React from 'react';
import { mount } from 'enzyme';
import PagedList from './PagedList';

describe('PagedList', () => {
  const Comp = () => null;
  const map = (_, a) => ({ a });
  const mapKey = (d) => parseInt(d.key(), 10);
  const mapPropA = (d) => d.prop('a');
  it('works with from=0', () => {
    const children = mount(<PagedList of={Comp} from={0} map={map} />).children();
    expect(children.map(mapKey)).toEqual([]);
    expect(children.map(mapPropA)).toEqual([]);
  });
  it('works with from=number', () => {
    const children = mount(<PagedList of={Comp} from={3} map={map} />).children();
    expect(children.map(mapKey)).toEqual([0, 1, 2]);
    expect(children.map(mapPropA)).toEqual([0, 1, 2]);
  });
  it('works with pages', () => {
    const children = mount(
      <PagedList of={Comp} from={10} pageSize={2} page={1} map={map} />,
    ).children();
    expect(children.map(mapKey)).toEqual([2, 3]);
    expect(children.map(mapPropA)).toEqual([2, 3]);
  });

  it('works with pageSize that do not match total', () => {
    const children1 = mount(
      <PagedList of={Comp} from={10} pageSize={3} page={1} map={map} />,
    ).children();
    const children2 = mount(
      <PagedList of={Comp} from={10} pageSize={3} page={3} map={map} />,
    ).children();
    expect(children1.map(mapKey)).toEqual([3, 4, 5]);
    expect(children1.map(mapPropA)).toEqual([3, 4, 5]);
    expect(children2.map(mapKey)).toEqual([9]);
    expect(children2.map(mapPropA)).toEqual([9]);
  });

  it('gets re-calculated only when deps (or non-number source) changes', () => {
    const MockComp = jest.fn(Comp);
    const wrapper = mount(
      <PagedList of={MockComp} from={10} map={map} deps={[1, 2]} />,
    );
    expect(MockComp).toHaveBeenCalledTimes(10);
    wrapper.setProps({ map: () => ({}) });
    expect(MockComp).toHaveBeenCalledTimes(10);
    wrapper.setProps({ map: () => ({}), deps: [1, 3] });
    expect(MockComp).toHaveBeenCalledTimes(20);
  });

  describe('pageMargin', () => {
    it('works with pageMargin', () => {
      const children = mount(
        <PagedList
          of={Comp}
          from={10}
          pageSize={2}
          page={2}
          pageMargin={1}
          map={map}
        />,
      ).children();
      expect(children.map(mapKey)).toEqual([2, 3, 4, 5, 6, 7]);
      expect(children.map(mapPropA)).toEqual([2, 3, 4, 5, 6, 7]);
    });

    it('treats source array as circular when pageMargin exceeds length', () => {
      const children1 = mount(
        <PagedList
          of={Comp}
          from={10}
          pageSize={2}
          page={0}
          pageMargin={1}
          map={map}
        />,
      ).children();
      const children2 = mount(
        <PagedList
          of={Comp}
          from={10}
          pageSize={2}
          page={9}
          pageMargin={1}
          map={map}
        />,
      ).children();
      expect(children1.map(mapKey)).toEqual([0, 1, 2, 3, 8, 9]);
      expect(children1.map(mapPropA)).toEqual([0, 1, 2, 3, 8, 9]);
      expect(children2.map(mapKey)).toEqual([0, 1, 6, 7, 8, 9]);
      expect(children2.map(mapPropA)).toEqual([0, 1, 6, 7, 8, 9]);
    });

    it(`runs map function only when it's needed`, () => {
      const mockMap = jest.fn((...args) => map(...args));
      const wrapper = mount(
        <PagedList
          of={Comp}
          from={10}
          pageSize={2}
          page={1}
          pageMargin={1}
          map={mockMap}
        />,
      );
      expect(mockMap).toHaveBeenCalledTimes(6);
      wrapper.setProps({ page: 2 });
      expect(mockMap).toHaveBeenCalledTimes(8);
    });
  });
});
