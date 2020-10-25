import React, { Component } from 'react'
import { connect } from 'react-redux';
import { NotificationManager } from 'react-notifications';
import { GetUserLogin, GetOrderDetails, CartHelper } from '../../../services';
import { removeFromCart, incrementToCart, decreaseToCart } from "../../../../store/actions/cartActions";
import Deliverydetails from './delivery';
class Checkout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subTotal: '', discount: '', deliveryCharge: 0, grandTotal: '', email: '', customer: '', paymentmethod: '', deliveryAddress: ''
        }
    }
    handleRadioChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }
    handleDeliveryAddress = (value) => {
        this.setState({ deliveryAddress: value })
    }
    async componentDidMount() {
        let email = sessionStorage.getItem('email')
        if (email) {
            let user = await GetUserLogin.getCustomerDetail(email);
            if (user) {
                this.setState({ customer: user.data, email: email })
            }
        }
        let cart = this.props.cartItems;
        let subTotal = cart.reduce((sum, i) => (sum += i.qty * i.netPrice), 0)
        let discount = cart.reduce((sum, i) => (sum += i.discount), 0)
        let grandTotal = subTotal + discount + this.state.deliveryCharge;

        this.setState({ subTotal: subTotal, discount: discount, grandTotal: grandTotal, deliveryCharge: this.state.deliveryCharge })

    }
    handlePlaceOrder = async (event) => {
        event.preventDefault();
        const { customer, grandTotal, deliveryAddress, paymentmethod } = this.state;
        let orderId = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))
        let { cartItems } = this.props
        let data = { customerId: customer.id, paymentmethod: paymentmethod, orderId: orderId, deliveryAddress: deliveryAddress, product: cartItems, grandTotal, grandTotal }
        if (data) {
            let order = await GetOrderDetails.getOrderCreateByUser(JSON.stringify(data));
            if (order) {
                NotificationManager.success("Successfully Ordered", "Order");
                setTimeout(
                    async function () {
                        CartHelper.emptyCart();
                    },
                    1000
                );
            } else {
                NotificationManager.error("Order is declined", "Order");
                setTimeout(
                    async function () {
                        window.location.href="/failed"
                    },
                    1000
                );
            }
        }
    }
    render() {
        const { cartItems } = this.props;
        const { subTotal, discount, deliveryCharge, grandTotal, email, customer, paymentmethod } = this.state;
        return (
            <div>
                <section className="pt-3 pb-3 page-info section-padding border-bottom bg-white single-product-header-bk">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <a href="/"><strong><span class="mdi mdi-home"></span> Home</strong></a> <span class="mdi mdi-chevron-right"></span> <a >Checkout</a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="checkout-page section-padding">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-8">
                                <div className="checkout-step">
                                    <div className="accordion" id="accordionExample">
                                        <div className="card checkout-step-one">
                                            <div className="card-header" id="headingOne">
                                                <h5 className="mb-0">
                                                    <button className="btn btn-link checkout-login-bk" disabled>
                                                        <span className="number">1</span> Login <span className="mdi mdi-checkbox-marked-circle-outline"></span>
                                                    </button>
                                                    <div className="_2jDL7w"><div><span className="dNZmcB">{customer.firstName} </span><span className="_3MeY5j">{email}</span></div></div>
                                                </h5>
                                            </div>
                                        </div>
                                        <div className="card checkout-step-two">
                                            <div className="card-header" id="headingTwo">
                                                <h5 className="mb-0">
                                                    <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                                        <span className="number">2</span> Delivery Address
                                                    </button>
                                                </h5>
                                            </div>
                                            <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
                                                <Deliverydetails onSelectDeliveryAddress={this.handleDeliveryAddress} />
                                            </div>
                                        </div>
                                        <div className="card">
                                            <div className="card-header" id="headingThree">
                                                <h5 className="mb-0">
                                                    <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                                        <span className="number">3</span> Payment
                                                    </button>
                                                </h5>
                                            </div>
                                            <div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
                                                <div className="checkout-step-body">
                                                    <div className="payment_method-checkout">
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="rpt100">
                                                                    <ul className="radio--group-inline-container_1">
                                                                        <li>
                                                                            <div className="radio-item_1">
                                                                                <input id="cashondelivery1" value="cash" name="paymentmethod" type="radio" onChange={this.handleRadioChange} />
                                                                                <label htmlFor="cashondelivery1" className="radio-label_1">Cash on Delivery</label>
                                                                            </div>
                                                                        </li>
                                                                        <li>
                                                                            <div className="radio-item_1">
                                                                                <input id="card1" value="card" name="paymentmethod" type="radio" onChange={this.handleRadioChange} />
                                                                                <label htmlFor="card1" className="radio-label_1">Credit / Debit Card</label>
                                                                            </div>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                                <div className="form-group return-departure-dts" style={paymentmethod === 'cash' ? { display: 'block' } : { display: 'none' }}>
                                                                    <div className="row">
                                                                        <div className="col-lg-12">
                                                                            <div className="pymnt_title">
                                                                                <h4>Cash on Delivery</h4>
                                                                                <p>Cash on Delivery will not be available if your order value exceeds Rs.150.</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="form-group return-departure-dts" style={paymentmethod === 'card' ? { display: 'block' } : { display: 'none' }}>
                                                                    <div className="row">
                                                                        <div className="col-lg-12">
                                                                            <div className="pymnt_title mb-4">
                                                                                <h4>Credit / Debit Card</h4>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-lg-6">
                                                                            <div className="form-group mt-1">
                                                                                <label className="control-label">Holder Name*</label>
                                                                                <div className="ui search focus">
                                                                                    <div className="ui left icon input swdh11 swdh19">
                                                                                        <input className="prompt srch_explore" type="text" name="holdername" defaultValue id="holder[name]" required maxLength={64} placeholder="Holder Name" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-lg-6">
                                                                            <div className="form-group mt-1">
                                                                                <label className="control-label">Card Number*</label>
                                                                                <div className="ui search focus">
                                                                                    <div className="ui left icon input swdh11 swdh19">
                                                                                        <input className="prompt srch_explore" type="text" name="cardnumber" defaultValue id="card[number]" required maxLength={64} placeholder="Card Number" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-lg-4">
                                                                            <div className="form-group mt-1">
                                                                                <label className="control-label">Expiration Month*</label>
                                                                                <select className="ui fluid search dropdown form-dropdown" name="card[expire-month]">
                                                                                    <option value>Month</option>
                                                                                    <option value={1}>January</option>
                                                                                    <option value={2}>February</option>
                                                                                    <option value={3}>March</option>
                                                                                    <option value={4}>April</option>
                                                                                    <option value={5}>May</option>
                                                                                    <option value={6}>June</option>
                                                                                    <option value={7}>July</option>
                                                                                    <option value={8}>August</option>
                                                                                    <option value={9}>September</option>
                                                                                    <option value={10}>October</option>
                                                                                    <option value={11}>November</option>
                                                                                    <option value={12}>December</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-lg-4">
                                                                            <div className="form-group mt-1">
                                                                                <label className="control-label">Expiration Year*</label>
                                                                                <div className="ui search focus">
                                                                                    <div className="ui left icon input swdh11 swdh19">
                                                                                        <input className="prompt srch_explore" type="text" name="card[expire-year]" maxLength={4} placeholder="Year" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-lg-4">
                                                                            <div className="form-group mt-1">
                                                                                <label className="control-label">CVV*</label>
                                                                                <div className="ui search focus">
                                                                                    <div className="ui left icon input swdh11 swdh19">
                                                                                        <input className="prompt srch_explore" name="card[cvc]" maxLength={3} placeholder="CVV" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {
                                                                    paymentmethod ?
                                                                        <button className="next-btn16 hover-btn" onClick={this.handlePlaceOrder}>Confirm Order</button>
                                                                        : ''
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card">
                                    <h5 className="card-header">My Cart <span className="text-secondary float-right">({cartItems.length} item)</span></h5>
                                    {
                                        cartItems.map((row, index) => (
                                            <div className="card-body pt-0 pr-0 pl-0 pb-0" key={index}>
                                                <div className="cart-list-product">
                                                    <img className="img-fluid" src={row.photo} alt="cart" />
                                                    <span className="badge badge-success">{row.discountPer}% OFF</span>
                                                    <h5>{row.name}</h5>
                                                    <h6><strong><span className="mdi mdi-approval" /> Available in</strong> - {row.unitSize} gm</h6>
                                                    <p className="offer-price mb-0">&#x20B9;{row.qty + '*' + row.netPrice} <i className="mdi mdi-tag-outline" /> <span className="regular-price">&#x20B9;{row.price}</span></p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    <div className="total-checkout-group">
                                        <div className="cart-total-dil">
                                            <h4>Sub Total</h4>
                                            <span>&#x20B9;{subTotal}</span>
                                        </div>
                                        <div className="cart-total-dil pt-3">
                                            <h4>Delivery Charges</h4>
                                            <span>&#x20B9;{deliveryCharge}</span>
                                        </div>
                                    </div>
                                    <div className="cart-total-dil saving-total ">
                                        <h4>Total Saving</h4>
                                        <span>&#x20B9;{discount}</span>
                                    </div>
                                    <div className="main-total-cart">
                                        <h2>Total</h2>
                                        <span>&#x20B9;{grandTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


            </div>
        )
    }
}

export default connect(
    (state) => ({
        cartItems: state.cart.cartItems,
    }),
    { incrementToCart, decreaseToCart, removeFromCart }
)(Checkout);