import { IOrderModel } from '../models/order';
import { IOrderView } from '../views/order';
import { IPresenter } from './base';

export interface IOrderPresenter extends IPresenter {
	model: IOrderModel;
	view: IOrderView;
}
