import { html } from 'lit';
import { Base } from '../Base';
import { getCartResource, setCartResource } from '../idbHelper';

export class Cart extends Base {
  constructor() {
    super();

    this.products = [];
    this.testValue;

    this.loaded = false;
  }

  static get properties() {
    return {
      products: { type: Array },
      total: { type: Number }
    };
  }

  /**
   * Remove a product from a cart
   * @param {object} data Product data
   */
  async removeProduct(data) {
    const card = await getCartResource();
    const userLogged = JSON.parse(localStorage.getItem('userLogged'));

    if (userLogged) {
      this.products = this.products.filter(el => el.product.id !== data.product.id);
      card.products = this.products;
      card.total -= 1;

      setCartResource(card);
    } else {
      const productsStorage = JSON.parse(localStorage.getItem("productsStorage"));
      const productsToRemove = (productsStorage?.remove?.length > 0) ? productsStorage.remove : [];
      const productsId = [];

      productsToRemove.forEach(el => {
        if (el.id === data.product.id) {
          productsId.push(el.id);
        }
      });

      if (!productsId.includes(data.product.id)) {
        productsToRemove.push({
          product: data.product,
          total: data.total
        });
      }

      localStorage.setItem(
        "productsStorage",
        JSON.stringify({
          remove: productsToRemove,
          update: (productsStorage?.update) ? productsStorage.update: []
        })
      );
    }
  }

  /**
   * Return an array filled between a range
   * @param {number} start Initial range
   * @param {number} end Last range
   * @returns Array of numbers filled
   */
  range(start, end) {
    return Array(end - start + 1).fill().map((_, idx) => start + idx);
  }

  /**
   * Return options for select tag
   * @param {number} count Products total
   * @param {number} limit Limit of elements to generate
   * @returns DOM elements generated
   */
  selectedOptions(count, limit) {
    const length = this.range(1, limit);

    return length.map((val) => html`
      <option value=${val} ?selected=${count === val}>${val}</option>
    `);
  }

  /**
   * Get price of product
   * @param {object} data Product data
   */
  getPrice(data) {
    return `${Math.round(data.product.price * data.total)} $`;
  }

  /**
   * Update price of product
   * @param {object} data Product data
   */
  updatePrice(data) {
    this.testValue = "toto";
    console.log(this.testValue);
    const price = document.getElementById("price");
    // if (price != null || price !== undefined) {
    //   if (price.childNodes[5]) {
    //     price.childNodes[5].childNodes[1].innerText = `Price : ${Math.round(data.product.price * data.total)} $`;
    //   }
    // }
    this.render("toto");
  }

  /**
   * Method trigger for each select changes
   * - Update products total value according to option selected
   * @param {object} data Product data
   * @param {string} event Option value selected
   */
  async onSelectChanges(data, event) {
    const value = event.target.value;
    const product = this.products.filter(el => el.product.id === data.product.id)[0];
    const userLogged = JSON.parse(localStorage.getItem('userLogged'));

    if (userLogged) {
      const card = await getCartResource();

      product.total = Number(value);
      card.products = this.products;

      setCartResource(card);
    } else {
      const productsStorage = JSON.parse(localStorage.getItem("productsStorage"));
      const productsToUpdate = (productsStorage?.update?.length > 0) ? productsStorage.update : [];

      if (productsToUpdate.length > 0) {
        productsToUpdate.forEach(el => {
          if (el.product.id !== product['product'].id) {
            product.total = Number(value);
            productsToUpdate.push(product);
          }
        });
      } else {
        productsToUpdate.push({
          product: data.product,
          total: Number(value)
        });
      }

      localStorage.setItem(
        "productsStorage",
        JSON.stringify({
          remove: (productsStorage?.remove) ? productsStorage.remove: [],
          update: productsToUpdate
        })
      );
    }

    this.updatePrice(data);
  }

  render(test) {
    this.loaded = true;
    const skeleton = document.querySelector('.skeleton');

    if (this.products.length === 0) {
      skeleton.removeAttribute('hidden', '');
    }

    return this.products.map(data => html`
      <div class="CartContainer">
        <div class="Header">
          <h3 class="Heading">Shopping cart</h3>
        </div>
        <div class="Cart-Items">
          <div class="image-box">
            <img src="http://localhost:9000/image/500/${data.product.image}" style={{ height="120px" }} />
          </div>
          <div class="about">
            <h1 class="title">${data.product.title}</h1>
          </div>
          <div class="counter">
            <select name="count" id="count-select" @change="${(event) => this.onSelectChanges(data, event)}">
              ${this.selectedOptions(data.total, data.total + 10)}
            </select>
          </div>
          <div class="prices">
            <div class="remove" @click="${() => this.removeProduct(data)}"><u>Remove</u></div>
          </div>
        </div>
        <div class="Footer">
          <h3 class="Footering mb-3" id="price">Price : ${test}</h3>
        </div>
      </div>
    `);
  }
}
customElements.define('app-cart', Cart);
