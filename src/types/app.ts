// types/app.ts
import { IApiClient } from './api/client';
import { IEventEmitter } from './events';
import { IStorage, IValidator } from './services';
import { ICatalogPresenter } from './presenters/catalog';
import { ICartPresenter } from './presenters/cart';
import { IOrderPresenter } from './presenters/order';

export interface IAppDependencies {
	api: IApiClient;
	eventEmitter: IEventEmitter;
	storage: IStorage;
	validator: IValidator;
}

export interface IApp {
	readonly catalogPresenter: ICatalogPresenter;
	readonly cartPresenter: ICartPresenter;
	readonly orderPresenter: IOrderPresenter;

	init(): Promise<void>;
	destroy(): void;
}