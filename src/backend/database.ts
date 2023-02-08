import { Client } from 'pg';

type Id = number;
type User = { id: Id | undefined, username: string };
type UserWithPassword = User & { passwordHash: string }
type Item = { id: Id | undefined, name: string, description: string, price: number };
type Cart = {
  id: Id | null,
  open: true,
  items: Item[]
}
type ClosedOrder = {
  id: Id | null,
  open: false,
  items: Item[]
}
type Order = Cart | ClosedOrder;

class Database {
  client: Client;

  constructor(client: Client) {
    this.client = client
  }

  async get_items(): Promise<Item[]> {
    let res = await this.client.query<Item>(
      'SELECT * FROM Item');
    return res.rows;
  }

  async get_item(item: { id: Id }): Promise<Item> {
    let res = await this.client.query<Item>(
      'SELECT * FROM Item WHERE ID = $1', [item.id]);
    return res.rows[0];
  }

  async query_items(query: string): Promise<Item[]> {
    let res = await this.client.query<Item>(
      'SELECT * FROM Item WHERE Name LIKE $1 OR Description LIKE $1',
      [`%${query}%`]
    );
    return res.rows;
  }

  async add_item(item: Item): Promise<Item> {
    let res = await this.client.query<Item>(
      'INSERT INTO Item (Name, Description, Price) VALUES ($1, $2, $3) RETURNING *',
      [item.name, item.description, item.price]
    );
    return res.rows[0];
  }

  async modify_item(item: Item): Promise<Item> {
    let res = await this.client.query<Item>(
      'UPDATE Item SET (Name, Description, Price) = ($1, $2, $3) WHERE ID = $4',
      [item.name, item.description, item.price, item.id]
    );
    return res.rows[0];
  }

  async delete_item(item: { id: Id }): Promise<void> {
    await this.client.query(
      'DELETE FROM Item WHERE ID = $1', [item.id]);
  }

  async get_users(): Promise<User[]> {
    let res = await this.client.query<User>(
      'SELECT ID, Username FROM User'
    );
    return res.rows;
  }

  async get_user(user: { id: Id }): Promise<User> {
    let res = await this.client.query<User>(
      'SELECT Id, Username FROM User WHERE ID = $1', [user.id]
    );
    return res.rows[0];
  }

  async get_user_with_password(user: { id: Id }): Promise<UserWithPassword> {
    let res = await this.client.query<UserWithPassword>(
      'SELECT Id, Username, PasswordHash FROM User WHERE ID = $1', [user.id]
    );
    return res.rows[0];
  }

  async get_user_role(user: { id: Id }): Promise<string> {
    let res = await this.client.query<{ role: string }>(
      'SELECT Role FROM User WHERE ID = $1', [user.id]
    );
    return res.rows[0].role;
  }

  async add_user(user: UserWithPassword): Promise<User> {
    let orderRes = await this.client.query(
      'INSERT INTO Order (Open) VALUES (True) RETURNING *'
    );
    let res = await this.client.query<User>(
      'INSERT INTO User (Username, PasswordHash, Cart_ID) VALUES ($1, $2, $3) RETURNING (Id, Username)',
      [user.username, user.passwordHash, orderRes.rows[0].id]
    );
    return res.rows[0];
  }

  async get_orders(): Promise<Order[]> {
    let res = await this.client.query<Order>(
      'SELECT * FROM Order');
    return res.rows;
  }

  async get_cart_by_user(user: { id: Id }): Promise<Cart> {
    let orderRes = await this.client.query(
      'SELECT Order.* FROM User JOIN Order ON User.Cart_ID = Order.ID WHERE User.ID = $1',
      [user.id]
    );
    let itemRes = await this.client.query<Item>(
      'SELECT Item.* FROM Item JOIN OrderItem ON Item.ID = OrderItem.Item_ID WHERE OrderItem.Order_ID = $1',
      [orderRes.rows[0].id]
    )
    orderRes.rows[0].items = itemRes.rows;
    return orderRes.rows[0];
  }

  async place_order_by_user(user: { id: Id }): Promise<void> {
    await this.client.query<ClosedOrder>(
      'UPDATE Order SET Open = False FROM User WHERE User.Cart_ID = Order.ID AND User.ID = $1',
      [user.id]
    );
  }

  async add_item_to_cart(item: { id: Id }, user: { id: Id }): Promise<void> {
    await this.client.query<Cart>(
      'INSERT INTO OrderItem SELECT $1, User.Cart_ID FROM User WHERE User.ID = $2',
      [item.id, user.id]
    );
  }
}