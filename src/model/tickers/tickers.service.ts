interface IResponse {
	TYPE: string;
	FROMSYMBOL: string;
	PRICE: number;
}

const API_KEY = '56b43b2681e484c56a639c1363090aaadb8b128e1af0f1064fcc83c61e77155f';

const tickersHandlers = new Map<string, ((newPrice: number) => void)[]>();

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

const AGGREGATE_INDEX = '5';

socket.addEventListener('message', (e) => {
	const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data) as IResponse;

	if (type !== AGGREGATE_INDEX || newPrice === undefined) {
		return;
	}

	const handlers = tickersHandlers.get(currency) ?? [];
	handlers.forEach((fn) => fn(newPrice));
});

function sendToWebSocket(message: { action: string; subs: string[] }) {
	const stringifiedMessage = JSON.stringify(message);

	if (socket.readyState === WebSocket.OPEN) {
		socket.send(stringifiedMessage);
		return;
	}

	socket.addEventListener(
		'open',
		() => {
			socket.send(stringifiedMessage);
		},
		{ once: true }
	);
}

function subscribeToTickerOnWs(ticker: string) {
	sendToWebSocket({
		action: 'SubAdd',
		subs: [`5~CCCAGG~${ticker}~USD`]
	});
}

function unsubscribeFromTickerOnWs(ticker: string) {
	sendToWebSocket({
		action: 'SubRemove',
		subs: [`5~CCCAGG~${ticker}~USD`]
	});
}

export const subscribeToTicker = (ticker: string, cb: (newPrice: number) => void) => {
	const subscribers = tickersHandlers.get(ticker) || [];
	tickersHandlers.set(ticker, [...subscribers, cb]);
	subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker: string) => {
	tickersHandlers.delete(ticker);
	unsubscribeFromTickerOnWs(ticker);
};

export const closeWS = () => {
	socket.close();
};
