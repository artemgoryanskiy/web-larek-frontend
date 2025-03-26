import { ICatalogModel } from '../models/catalog';
import { ICatalogView } from '../views/catalog';
import { IPresenter } from './base';

export interface ICatalogPresenter extends IPresenter {
	model: ICatalogModel;
	view: ICatalogView;
}
