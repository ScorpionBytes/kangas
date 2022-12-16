import fetchAsset from '../../../lib/fetchAsset';
import ImageCanvasCell from './ImageCanvas/ImageCanvasCell';
import { Suspense } from 'react';
// TODO create a parseDataURL helper

import classNames from 'classnames/bind';
import styles from '../Cell.module.scss';

const cx = classNames.bind(styles);


const PlainImageCell = async ({ value, query, expanded=false }) => {
    const { type, assetType, assetId } = value;
    const { dgid } = query;
    const image = await fetchAsset({ query: { assetId, dgid, thumbnail: true }, returnUrl: true });

    return (
            <div className={cx("cell-content")}>
                <img
                    src={`data:application/octet-stream;base64,${image}`}
                    alt="DataGrid Image"
                />
            </div>
    );
};

const ImageCell = ({ value, query, expanded }) => {
    return (
        <Suspense fallback={<>Loading</>}>
            {!!expanded && <ImageCanvasCell value={value} query={query} expanded={true} /> }
            { !expanded && <PlainImageCell value={value} query={query} expanded={false} /> }
        </Suspense>
    )
}

export default ImageCell;
