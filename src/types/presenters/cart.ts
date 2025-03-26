import { ICartModel } from '../models/cart';
import { ICartView } from '../views/cart';
import { IPresenter } from './base';

export interface ICartPresenter extends IPresenter {
	model: ICartModel;
	view: ICartView;
}
