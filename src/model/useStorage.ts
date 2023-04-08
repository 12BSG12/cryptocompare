import { ref, type Ref } from 'vue';

function getItem<T>(key: string, storage: Storage): T | null | string {
	const value = storage.getItem(key);
	if (!value) {
		return null;
	}
	return JSON.parse(value);
}

export function useStorage<T>(key: string, type: 'session' | 'local' = 'local'): [Ref<T | null>, (data: T) => void] {
	let storage: Storage;
	switch (type) {
		case 'session':
			storage = sessionStorage;
			break;
		case 'local':
			storage = localStorage;
			break;
	}
	const value = ref(getItem<T>(key, storage)) as Ref<T | null>;
	const setItem = (st: Storage) => {
		return (newValue: T | null) => {
			value.value = newValue;
			st.setItem(key, JSON.stringify(newValue));
		};
	};
	return [value, setItem(storage)];
}
