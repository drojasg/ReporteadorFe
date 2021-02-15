import React, { Component } from 'react';
import { CleverAccordion } from 'clever-component-library';
import CancellationPolicy from './categories/CancellationPolicies';
import BookingGuarantees from './categories/BookingGuarantees';
import TaxRuleGroup from './categories/TaxRuleGroup';
import Cancelation from './categories/Cancelation';
import PaymetTerms from './categories/PaymentTerms';
export default class PropertyPolicies extends Component {
    constructor(props) {
        super(props);
        this.newPolicyCancellationPolicy = this.newPolicyCancellationPolicy.bind(this);
        this.newPolicyBookingGuarantee = this.newPolicyBookingGuarantee.bind(this);
        this.newPolicyTaxRuleGroup = this.newPolicyTaxRuleGroup.bind(this);
        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            propertySelected: JSON.parse(hotelSelected),
        };
    }
    btnSaveCancellation = React.createRef();
    btnSavePaymentTerm = React.createRef();

    newPolicyCancellationPolicy() {
        this.refCancellationPolicy.createCancellationPolicy();
    }

    newPolicyBookingGuarantee() {
        this.refBookingGuarantee.createBookingGuaranteePolicy();
    }

    newPolicyTaxRuleGroup() {
        this.refTaxRuleGroup.createTaxRuleGroup();
    }

    render() {
        return (
            <div className="row">
                <CleverAccordion
                    id="cancelation-collapsible"
                    size="col s12 m12 l12"
                    accordion={
                        {
                            head: [
                                { accordion: 'ca_po', label: 'Cancellation Policies', controls: [{ control: <button type="button" ref={this.btnSaveCancellation} id="btnSaveCancellation" className='btn'><i className="material-icons">add</i></button> }] },
                                { accordion: 'bo_gu', label: 'Booking Guarantees', controls: [{ control: <button type="button" id={"btn_bo_gu"} className='btn' onClick={this.newPolicyBookingGuarantee}><i className="material-icons">add</i></button> }] },
                                { accordion: 'ta_ru_gr', label: 'Tax Rule Group', controls: [{ control: <button type="button" id={"btn_ta_ru_gr"} className='btn' onClick={this.newPolicyTaxRuleGroup}><i className="material-icons">add</i></button> }] },
                                { accordion: 'pa_ter', label: 'Payment Terms', controls: [{ control: <button type="button" ref={this.btnSavePaymentTerm} id="btn_pa_ter" className='btn'><i className="material-icons">add</i></button> }] }
                            ],
                            body: [
                                {
                                    "ca_po":
                                        <Cancelation reference={this.btnSaveCancellation} />,
                                    "bo_gu":
                                        <BookingGuarantees ref={ref => this.refBookingGuarantee = ref} />,
                                    "ta_ru_gr":
                                        <TaxRuleGroup ref={ref => this.refTaxRuleGroup = ref} />,
                                    "pa_ter":
                                    <PaymetTerms reference={this.btnSavePaymentTerm} />

                                }
                            ]
                        }
                    }
                />

            </div>
        );
    }
}
