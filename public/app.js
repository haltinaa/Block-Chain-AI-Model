const contractAddress = '0x1A1cF0357d1a4a4f48AA0e49fA3584b19CD6dfd7'; // Замените на адрес вашего контракта

let contractABI = window.abi;

window.addEventListener('load', async () => {
	if (typeof window.ethereum !== 'undefined') {
		try {
			console.log('Contract ABI loaded:', contractABI); // Log the ABI to check its structure

			// Now create the web3 instance and contract instance
			web3 = new Web3(window.ethereum);
			await window.ethereum.request({ method: 'eth_requestAccounts' });
			contract = new web3.eth.Contract(contractABI, contractAddress);
			await loadCurrentAccount();
			await loadModels(); // Load models on page load

		} catch (error) {
			console.error('Error loading ABI or initializing contract:', error);
			return; // Stop execution if the ABI can't be loaded
		}
	} else {
		alert('Please install MetaMask!');
	}
});





let web3;
let contract;
let currentAccount = '0x5D6EcB5B67925dA0865E62F44C766620Cdb2407B';

window.addEventListener('load', async () => {
	if (typeof window.ethereum !== 'undefined') {
		web3 = new Web3(window.ethereum);
		await window.ethereum.request({ method: 'eth_requestAccounts' });
		contract = new web3.eth.Contract(contractABI, contractAddress);
		await loadCurrentAccount();
		await loadModels(); // Загрузить модели при загрузке страницы
	} else {
		alert('Пожалуйста, установите MetaMask!');
	}

	const addModelButton = document.getElementById("addModelButton");
	addModelButton.addEventListener("click", async (event) => {
		event.preventDefault();
		await addModel();
	});
});




// Функция для загрузки текущего аккаунта
async function loadCurrentAccount() {
	const accounts = await web3.eth.getAccounts();
	currentAccount = accounts[0];
	document.getElementById('currentAccount').innerText = `Текущий аккаунт: ${currentAccount}`;
}

document.getElementById('switchAccount').addEventListener('click', async () => {
	try {
		// Request the user's accounts
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

		// Check if accounts were returned
		if (accounts.length === 0) {
			alert('No accounts found. Please connect to MetaMask.');
			return; // Exit if no accounts are found
		}

		// Update the current account
		currentAccount = accounts[0];
		console.log(`Switched to account: ${currentAccount}`);

		// Update the displayed current account
		document.getElementById('currentAccount').innerText = `Current Account: ${currentAccount}`;

		// Reload models to reflect any changes
		await loadModels(); // Ensure models are fetched based on the new account
	} catch (error) {
		console.error('Error switching account:', error);
		alert('Failed to switch account. Please try again.');
	}
});


async function loadModels() {
	try {
		const models = await contract.methods.getAllModels().call(); // Ensure this matches your contract method
		console.log(models);
		const modelList = document.getElementById('model-list');
		modelList.innerHTML = ''; // Clear previous models

		models.forEach(model => {
			const modelElement = document.createElement('div');
			modelElement.classList.add('model-card'); // Add a CSS class for styling

			// Structure the content
			modelElement.innerHTML = `
				<h3>${model.name}</h3>
				<p><strong>Model ID:</strong> ${model.id}</p>
				<p><strong>Description:</strong> ${model.description}</p>
				<p><strong>Price:</strong> ${model.price} ETH</p>
				<p><strong>Total Rating:</strong> ${model.totalRating}</p>
				<p><strong>Rating Count:</strong> ${model.ratingCount}</p>
				<button class="purchase-btn">Purchase</button>
			`;

			modelList.appendChild(modelElement);
		});
	} catch (error) {
		console.error('Error loading models:', error);
	}
}







async function addModel() {
	const modelName = document.getElementById("modelName").value; // Название модели
	const modelDescription = document.getElementById("modelDescription").value; // Описание модели
	const modelPrice = document.getElementById("modelPrice").value; // Цена в Wei




	try {
		// Выполнение метода контракта для добавления модели
		await contract.methods.addModel(modelName, modelDescription, modelPrice).send({ from: currentAccount });

		// Если добавление прошло успешно, выводим всплывающее сообщение
		alert("Модель успешно добавлена!");

		// Здесь можно добавить код для обновления списка моделей
		loadModels(); // Обновляем список моделей, если нужно
	} catch (error) {
		console.error('Ошибка при добавлении модели:', error);
		console.log("Ошибка при добавлении модели: " + error.message);
	}
}

function addModelCard(modelName, modelId, description, price, totalRating, ratingCount) {
	const modelsDiv = document.getElementById('models');

	// Create the model card div
	const modelCard = document.createElement('div');
	modelCard.className = 'model-card';

	// Create the content of the card
	modelCard.innerHTML = `
        <div>
            <h3>${modelName}</h3>
            <p>Model Id: ${modelId}</p>
            <p>Description: ${description}</p>
            <p>Price: ${price}</p>
            <p>Total Rating: ${totalRating}, Rating Count: ${ratingCount}</p>
			<p>Creator: </p>
        </div>
        <button>Buy Model</button>
    `;

	// Append the card to the models div
	modelsDiv.appendChild(modelCard);
}



async function initContract() {
	try {
		// Убедитесь, что Web3 инициализирован и подключен к MetaMask
		if (!web3) {
			throw new Error('Web3 is not initialized');
		}

		// Создайте экземпляр контракта
		contract = new web3.eth.Contract(contractABI, contractAddress);

		// Проверьте, что контракт инициализирован правильно
		const modelCount = await contract.methods.modelCount().call();
		console.log('Количество моделей:', modelCount);
	} catch (error) {
		console.error('Ошибка при инициализации контракта:', error);
	}
}


document.getElementById('addModelForm').addEventListener('submit', async (event) => {
	event.preventDefault();
	const name = document.getElementById('modelName').value;
	const description = document.getElementById('modelDescription').value;
	const price = document.getElementById('modelPrice').value;

	await contract.methods.addModel(name, description, price).send({ from: currentAccount });

	await loadModels(); // Обновляем список моделей
});


document.getElementById('purchaseModel').addEventListener('click', async () => {
	const id = document.getElementById('modelId').value;
	const model = await contract.methods.getModelDetails(id).call();


	await contract.methods.purchaseModel(id).send({ from: currentAccount, value: model.price });
	await loadModels(); // Обновляем список моделей
});

document.getElementById('rateModel').addEventListener('click', async () => {
	const id = document.getElementById('ratingId').value;
	const rating = document.getElementById('modelRating').value;

	await contract.methods.rateModel(id, rating).send({ from: currentAccount });
	await loadModels(); // Обновляем список моделей после оценки
});

//Получение деталей модели
document.getElementById('getModelDetails').addEventListener('click', async () => {
	const id = document.getElementById('detailsId').value;
	const model = await contract.methods.models(id).call();

	const modelDetailsDiv = document.getElementById('modelDetails');
	modelDetailsDiv.innerHTML = `<p>ID: ${model.id}, Название: ${model.name}, Описание: ${model.description}, Цена: ${model.price} Wei</p>`;
});
