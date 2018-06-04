// @flow

type ConstructorParams = {
	host   : string,
	port   : number,
	dbName : string,
	client : any
};

export default class DbConnection {
	constructor({ host, port, dbName, client }: ConstructorParams) {
		this._host   = host;
		this._port   = port;
		this._name   = dbName;
		this._client = client;
	}
	
	get client() {
		return this._client;
	}
	
	connect() {
		return this._client.connect(`mongodb://${this._host}/${this._name}:${this._port}`);
	}
};