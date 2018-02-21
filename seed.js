let db = require('./src/database')();

const users = [
	{
		id: 1,
		name: 'Роман Ефимов',
		email: 'efim1382@gmail.com',
		phone: '+79094079312',
		address: 'Ростов-на-Дону, Гвардейский, 6',
		photo: '/images/user-image.jpg',
		hash: 'sha1$c96b7db9$1$6d652247b50eacc0bf5bc20573f941dcb692c218',
		token: 'fsdgertq34t34fergerg34f4vw',
	},

	{
		id: 2,
		name: 'Петр Петров',
		email: 'petr@mail.ru',
		phone: '+79092343765',
		address: 'Ростов-на-Дону, Красноармейская, 32',
		photo: '/images/user-image.jpg',
		hash: 'sha1$c96b7db9$1$6d652247b50eacc0bf5bc20573f941dcb692c218',
		token: 'g3t5k3nrlekgmlemfl34t2efwkl',
	},

	{
		id: 3,
		name: 'Иван Иванов',
		email: 'ivan@mail.ru',
		phone: '+79093423543',
		address: 'Ростов-на-Дону, Ворошиловский, 133',
		photo: '/images/user-image.jpg',
		hash: 'sha1$c96b7db9$1$6d652247b50eacc0bf5bc20573f941dcb692c218',
		token: 'klj2h34k2kj3rekjwfkwfekewkjfn',
	},
];

const adverts = [
	{
		id: 1,
		idUser: 1,
		title: 'Детская куртка',
		date: '21 февраля, 2018',
		price: 1500,
		category: 'clothes',
		description: 'Хорошая куртка',
		mainImage: '/images/ad-image.jpg',
	},

	{
		id: 2,
		idUser: 1,
		title: 'Детские кроссовки',
		date: '20 февраля, 2018',
		price: 1000,
		category: 'footwear',
		description: 'Хорошие кроссовки',
		mainImage: '/images/ad-image.jpg',
	},

	{
		id: 3,
		idUser: 2,
		title: 'Детская футболка',
		date: '19 февраля, 2018',
		price: 500,
		category: 'clothes',
		description: 'Хорошая футболка',
		mainImage: '/images/ad-image.jpg',
	},

	{
		id: 4,
		idUser: 3,
		title: 'Детская коляска',
		date: '15 февраля, 2018',
		price: 2000,
		category: 'goods',
		description: 'Хорошая коляска',
		mainImage: '/images/ad-image.jpg',
	},
];

const favorites = [
	{
		id: 1,
		idUser: 1,
		idAdvert: 3,
	},

	{
		id: 2,
		idUser: 1,
		idAdvert: 4,
	},

	{
		id: 3,
		idUser: 2,
		idAdvert: 1,
	},

	{
		id: 4,
		idUser: 3,
		idAdvert: 2,
	},
];

const reviews = [
	{
		id: 1,
		text: 'Хороший продавец',
		idAuthor: 1,
		idRecipient: 2,
		emotion: 'like',
	},

	{
		id: 2,
		text: 'Хороший продавец',
		idAuthor: 2,
		idRecipient: 1,
		emotion: 'like',
	},

	{
		id: 3,
		text: 'Плохой продавец',
		idAuthor: 1,
		idRecipient: 3,
		emotion: 'dislike',
	},

	{
		id: 4,
		text: 'Хороший продавец',
		idAuthor: 3,
		idRecipient: 2,
		emotion: 'like',
	},
];

db.serialize(function() {
	db.run(`
		INSERT INTO user (${createTitles(users)})
		VALUES ${createPlaceholder(users)}
	`, createValues(users));

	db.run(`
		INSERT INTO advert (${createTitles(adverts)})
		VALUES ${createPlaceholder(adverts)}
	`, createValues(adverts));

	db.run(`
		INSERT INTO favorites (${createTitles(favorites)})
		VALUES ${createPlaceholder(favorites)}
	`, createValues(favorites));

	db.run(`
		INSERT INTO review (${createTitles(reviews)})
		VALUES ${createPlaceholder(reviews)}
	`, createValues(reviews));
});

db.close();

function createPlaceholder(array) {
	let string = Object.keys(array[0]).map(key => '?').join(',');
	return array.map(item => `(${string})`).join(',');
}

function createValues(array) {
	let filteredArray = [];

	array.map(item => {
		filteredArray = filteredArray.concat(Object.values(item));
	});

	return filteredArray;
}

function createTitles(array) {
	return Object.keys(array[0]).join();
}
