import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productService: ProductService,
  ) {}

  async findByUser(userId: string): Promise<Cart> {
    let cart = await this.cartModel.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }

    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    const product = await this.productService.findOne(productId);
    let cart = await this.findByUser(userId);

    const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.totalAmount = cart.items.reduce((total, item) => total + item.quantity * product.price, 0);

    return cart.save();
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.findByUser(userId);
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    const products = await Promise.all(
      cart.items.map((item) => this.productService.findOne(item.product.toString())),
    );

    cart.totalAmount = cart.items.reduce(
      (total, item, index) => total + item.quantity * products[index].price,
      0,
    );

    return cart.save();
  }
}
