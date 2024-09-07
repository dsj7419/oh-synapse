declare module 'react-window-infinite-loader' {
    import { ListChildComponentProps } from 'react-window';
  
    export interface InfiniteLoaderProps {
      isItemLoaded: (index: number) => boolean;
      itemCount: number;
      loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
      children: (props: { onItemsRendered: any; ref: any }) => JSX.Element;
      threshold?: number;
      minimumBatchSize?: number;
    }
  
    export default class InfiniteLoader extends React.Component<InfiniteLoaderProps, any> {}
  }
  