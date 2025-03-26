import { IModel } from '../models/base';
import { IView } from '../views/base';

export interface IPresenter {
	init(): void;
	destroy(): void;
}

export interface IPresenterConstructor<
	M extends IModel = IModel,
	V extends IView = IView
> {
	new (model: M, view: V): IPresenter;
}
