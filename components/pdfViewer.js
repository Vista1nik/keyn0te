import React from 'react';

import Loading from './ui/loading'

import {
  Document, Page,
} from 'react-pdf/dist/esm/entry.webpack';

const PdfViewer = ({
  url, width, pageNumber, onLoad
}) => (
  <Document onLoadSuccess={onLoad} file={url}>
    <Page
      pageNumber={pageNumber}
      width={width}
      loading={<Loading />}
    />
  </Document>
);

export default PdfViewer;