import { Client } from 'pg';
import { roles } from '../middleware/authorization';

type Id = number;
type User = { id?: Id, username: string, passwordhash: string, role?: roles };
type Item = { id?: Id, name: string, description: string, price: number };
type Cart = {
  id?: Id,
  open: true,
  user: User
}
type ClosedOrder = {
  id?: Id,
  open: false,
  user: User
}
type Order = Cart | ClosedOrder;

class Database {
  client: Client;

  constructor(client: Client) {
    this.client = client
  }

  async connect() {
    await this.client.connect();
  }

  async get_items(): Promise<Item[]> {
    let res = await this.client.query<Item>(
      'SELECT * FROM Item');
    return res.rows;
  }

  async get_item(item: { id?: Id }): Promise<Item> {
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

  async delete_item(item: { id?: Id }): Promise<void> {
    await this.client.query(
      'DELETE FROM Item WHERE ID = $1', [item.id]);
  }

  async get_users(): Promise<User[]> {
    let res = await this.client.query<User>(
      'SELECT ID, Username FROM User'
    );
    return res.rows;
  }

  async get_user(user: { id?: Id }): Promise<User> {
    let res = await this.client.query<User>(
      'SELECT * FROM Users WHERE ID = $1', [user.id]
    );
    return res.rows[0];
  }

  async get_user_by_username(username: string): Promise<User> {
    let res = await this.client.query<User>(
      'SELECT * FROM Users WHERE Username = $1', [username]
    );
    return res.rows[0];
  }

  async add_user(user: User): Promise<User> {
    let res = await this.client.query<User>(
      'INSERT INTO Users (Username, PasswordHash, Role) VALUES ($1, $2, $3) RETURNING *',
      [user.username, user.passwordhash, roles.normal_user]
    );
    this.open_new_cart(res.rows[0]);
    return res.rows[0];
  }

  async open_new_cart(user: {id?: Id}): Promise<Cart> {
    let res = await this.client.query(
      'INSERT INTO Orders (Open, User_ID) VALUES (TRUE, $1) RETURNING *',
      [user.id]
    );
    return res.rows[0];
  }

  async get_orders(): Promise<Order[]> {
    let res = await this.client.query(
      'SELECT * FROM Order');
    for (let order of res.rows)
      order.user = await this.get_user({id:order.user_id});
    return res.rows;
  }

  async get_cart_by_user(user: { id?: Id }): Promise<Cart> {
    let orderRes = await this.client.query(
      'SELECT * FROM Order Open = TRUE AND User_ID = $1',
      [user.id]
    );
    if (!orderRes.rows[0])
      orderRes.rows[0] = await this.open_new_cart(user);
    orderRes.rows[0].user = await this.get_user(user);
    return orderRes.rows[0];
  }

  async get_order_items(order: {id?: Id}): Promise<Item[]> {
    let itemRes = await this.client.query<Item>(
      'SELECT Item.* FROM Item JOIN OrderItem ON Item.ID = OrderItem.Item_ID WHERE OrderItem.Order_ID = $1',
      [order.id]
    );
    return itemRes.rows;
  }

  async place_order_by_user(user: { id?: Id }): Promise<void> {
    await this.client.query<ClosedOrder>(
      'UPDATE Orders SET Open = False WHERE User_ID = $1',
      [user.id]
    );
    await this.open_new_cart(user);
  }

  async add_item_to_cart(item: { id?: Id }, user: { id?: Id }): Promise<void> {
    await this.client.query<Cart>(
      'INSERT INTO OrderItem SELECT $1, Order.ID FROM Order WHERE Order.User_ID = $2',
      [item.id, user.id]
    );
  }
}

export default new Database(new Client({
  user: 'filip',
  host: 'localhost',
  database: 'filip',
  password: 'pass',
  port: 5432,
}));
