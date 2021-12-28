import React, { ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { ItemContent, LogLevel, Virtuoso } from 'react-virtuoso';
import Logger from 'app/services/Logger';

const logger = Logger.getLogger(`ListBuilder`);
const START_INDEX = 1000000;
const IDENTIFIER = 'threadId';

type Props = {
  items: any[];
  loadMore: (direction: 'history' | 'future') => Promise<void>;
  itemContent: ItemContent<any>;
  itemId: (item: any) => string;
  emptyListComponent: ReactNode;
  atBottomStateChange?: (atBottom: boolean) => void;
};

export default React.memo(
  ({ emptyListComponent, itemId, loadMore, items, itemContent, atBottomStateChange }: Props) => {
    const virtuosoRef = useRef(null);
    const [initiated, setInitiated] = useState(false);

    const more = async (direction: 'future' | 'history') => {
      const result = await loadMore(direction);
      setInitiated(true);
      return result;
    };

    useEffect(() => {
      if (items.length === 0) {
        more('history').then(() => {
          if (atBottomStateChange) atBottomStateChange(true);
        });
      } else {
        more('future');
      }
    }, []);

    const firstItemIndex = useRef(START_INDEX);
    const firstItemId = useRef('');
    if (items.length > 0) {
      if (firstItemId.current) {
        firstItemIndex.current =
          firstItemIndex.current - items.map(i => itemId(i)).indexOf(firstItemId.current);
      }
      firstItemId.current = itemId(items[0]);
    }

    (window as any).globalThis.VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG;

    if (items.length === 0) {
      return <div style={{ flex: 1 }}>{initiated ? emptyListComponent || <></> : <></>}</div>;
    }

    return (
      <>
        <Suspense fallback={<div style={{ flex: 1 }}>loading...</div>}>
          <Virtuoso
            ref={virtuosoRef}
            initialTopMostItemIndex={items.length - 1}
            firstItemIndex={firstItemIndex.current}
            itemContent={itemContent}
            data={items}
            followOutput={'smooth'}
            alignToBottom
            startReached={async () => {
              await more('history');
            }}
            endReached={async () => {
              await more('future');
            }}
            atBottomStateChange={atBottomStateChange}
            atTopStateChange={atTop => {}}
            computeItemKey={(_index, item) => itemId(item)}
          />
        </Suspense>
      </>
    );
  },
);