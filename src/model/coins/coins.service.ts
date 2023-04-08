import axios from 'axios';
import { ref, onMounted } from 'vue';

interface ICoinsList {
	Data: {
		Id: string;
		ImageUrl: string;
		Symbol: string;
		FullName: string;
	};
}

export function useCoinsQuery() {
	const coinList = ref<string[]>([]);
	const isLoading = ref(false);
	const errorMessage = ref('');
	onMounted(async () => {
		try {
			isLoading.value = true;
			const { data } = await axios.get<ICoinsList>(
				`https://min-api.cryptocompare.com/data/all/coinlist?summary=true&api_key=56b43b2681e484c56a639c1363090aaadb8b128e1af0f1064fcc83c61e77155f`
			);
			coinList.value = Object.keys(data.Data);
			isLoading.value = false;
		} catch (error) {
			errorMessage.value = 'Ошибка работы сервера...';
		}
	});

	return {
		coinList,
		isLoading,
		error: errorMessage
	};
}
