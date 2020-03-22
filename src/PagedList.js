/* eslint-disable react/no-array-index-key */
import React, { useMemo, useRef } from 'react';
import { uniq, flatten } from 'lodash/fp';
import PropTypes from 'prop-types';

const range = (a, b) =>
  Array(b - a)
    .fill()
    .map((_, idx) => idx + a);
const isNumber = (d) => typeof d === 'number';

const getVisiblePages = (page, extra, length) =>
  uniq(
    range(page - extra, page + extra + 1).map(
      (p) => (length + (p % length)) % length,
    ),
  );

const BasePagedList = ({
  of,
  from,
  map = (d) => d,
  pageSize = isNumber(from) ? from : from.length,
  pageMargin = 0,
  page: currentPage = 0,
  deps = [],
}) => {
  const arr = useMemo(() => (isNumber(from) ? range(0, from) : from), [
    from,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...deps,
  ]);
  const pages = useRef();
  const { current } = useRef({ arr, pageSize });
  if (!pages.current || arr !== current.arr || pageSize !== current.pageSize) {
    Object.assign(current, { arr, pageSize });
    pages.current = Array(Math.ceil(arr.length / pageSize || 0)).fill();
  }
  pages.current = useMemo(() => {
    const visiblePages = getVisiblePages(
      currentPage,
      pageMargin,
      Math.ceil(arr.length / pageSize),
    );

    return pages.current.map((page, pageIdx) => {
      if (!visiblePages.includes(pageIdx)) {
        return null;
      }
      if (page) {
        return page;
      }
      return arr
        .slice(pageSize * pageIdx, pageSize * (pageIdx + 1))
        .map((d, i) => {
          const props = map(d, pageSize * pageIdx + i, arr);
          if (props == null) {
            return null;
          }
          return React.isValidElement(of)
            ? React.cloneElement(of, {
                ...props,
                key: pageSize * pageIdx + i,
              })
            : React.createElement(of, {
                ...props,
                key: pageSize * pageIdx + i,
              });
        });
    });
  }, [currentPage, pageMargin, arr, pageSize, map, of]);
  return flatten(pages.current.filter(Boolean));
};

const PagedList = React.memo(BasePagedList);

PagedList.propTypes = {
  of: PropTypes.oneOfType([
    PropTypes.elementType.isRequired,
    PropTypes.element.isRequired,
  ]).isRequired,
  from: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.arrayOf(PropTypes.any.isRequired),
  ]).isRequired,
  map: PropTypes.func,
  pageSize: PropTypes.number,
  page: PropTypes.number,
  pageMargin: PropTypes.number,
  deps: PropTypes.arrayOf(PropTypes.any),
};

export default PagedList;
