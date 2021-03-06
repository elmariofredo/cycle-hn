import { view } from './view';
import { VNode } from '@cycle/dom';
import { API_URL } from '../../app';
import isolate from '@cycle/isolate';
import xs, { Stream } from 'xstream';
import {
    PageSinks as Sinks,
    PageSources as Sources,
    PageReducer as Reducer
} from '../types';
import { makeReducer$ } from './reducer';
import { HTTPSource, RequestOptions } from '@cycle/http';
import { FeedsCollection } from '../../components/FeedCollection';

function requestMapper({page, type}: {page: string, type: string}): RequestOptions {
    return {
        method: 'GET',
        category: 'feeds',
        query: {page},
        url: API_URL + `/${type}.json`
    };
}

export default function FeedsList(sources: Sources): Sinks {
    const state$ = sources.onion.state$;

    const request$ = sources.params$.map(requestMapper);

    const reducers$: Stream<Reducer> = makeReducer$(sources);
    const feedsCollection = isolate(FeedsCollection, 'feeds')(sources);

    const feedsDom$ = feedsCollection.DOM;
    const pageDom$: Stream<VNode> = view(state$, feedsDom$);

    const sinks = {
        DOM: pageDom$,
        HTTP: request$,
        onion: reducers$
    };

    return sinks;
}
