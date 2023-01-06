'use client';

import Select from 'react-select';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import useQueryParams from '../../lib/hooks/useQueryParams';

import classNames from 'classnames/bind';
import styles from './MatrixSelectClient.module.scss';
const cx = classNames.bind(styles);


// Ideally, we wouldn't need to import a third-party library for a select component here,
// but native select components are annoying to style
const MatrixSelect = ({ query, options=['blah'] }) => {
    const { params, updateParams } = useQueryParams();

    const changeDatagrid = useCallback((e) => {
        updateParams({
            datagrid: e.value
        });
    }, [updateParams]);

    const customStyles = {
        menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
    };

    // FIXME: don't use endsWith, but something smarter
    return (
        <Select
            id={'matrix-select-pulldown'}
            className={cx('matrix-select')}
            value={
                options.find((item) => item?.value?.endsWith(params?.datagrid)) || ''
            }
            options={options}
            styles={customStyles}
            onChange={changeDatagrid}
        />
    );
};

export default MatrixSelect;
