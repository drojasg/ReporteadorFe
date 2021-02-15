import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Login } from 'clever-component-library';
import NotFound from './NotFound';
/* Components */
import PropertiesHeader from './components/propertiesHeader/PropertiesHeader';
/* Property */
import MainDescription from './view/property/descriptions/MainGeneral';
import TermsAndConditions from './view/property/termsandconditions/TermsAndConditions';
import PropertyGeneral from './view/property/general/PropertyGeneral';
import PropertyAmenities from './view/property/amenities/PropertyAmenities';
import Dashboard from './view/SelectHotel/MainSelectHotel';
import Policies from './view/property/policies/Policies';
import MainSeason from './view/property/seasons/MainSeason';
import PropertyAgeRange from './view/property/age_range/AgeRangeGeneral';
import MainRoom from './view/property/roomTypes/MainRoom';
import BookingGuarantees from './view/property/policies/categories/BookingGuarantees';
import UploadGalllery from './view/property/upload_gallery/UploadGalllery';
/* Rates */
import Services from './view/rates/services/ServiceGeneral';
import Crossout from './view/rates/crossout/Crossout';
import AccessRestrictionsGeneral from './view/rates/access_restrictions/AccessRestrictionsGeneral';
import RatePlanGeneral from './view/rates/rate_plan/RatePlanGeneral';
import MainVouchers from './view/rates/vouchers/MainVouchers';
import MainRateCalendar from './view/rates/rate_calendar/MainRateCalendar';
import PromotionsMain from './view/rates/promotions/PromotionsMain'
import MainRoomDisabled from './view/rates/room_disabled/MainRoomDisabled';
/* Catalogue */
import CountriesAndMarkets from './view/catalogue/countries_and_markets/CountriesAndMarkets';
import ConfigBooking from './view/catalogue/config_booking/ConfigBookingGeneral';
import Currency from './view/catalogue/currency/CurrencyGeneral';
import AmenitiesMain from './view/catalogue/amenities/AmenitiesMain';
import TimeZones from './view/catalogue/time_zones/TimeZones'
import FilterMain from './view/catalogue/filters/FilterMain'
import Brands from './view/catalogue/brands/BrandsGeneral';
import ExChange from './view/catalogue/ex_change/ExChangeMain';
/* Operations */
import MainBooking from './view/operations/booking/MainBooking';
/* Guest */
import MainBookingList from './view/guests/bookings/MainBookingList';
/* Settings */
import PushRates from './view/settings/pushRates/PushRates';
import Credentials from './view/settings/credentials/users/Users'; 
import RolesAndPermissions from './view/settings/credentials/rolesAndPermissions/RolesAndPermissions';
import EndpointPermissions from './view/settings/credentials/endpointPermissions/EdpointPermissions';
import Channels from './view/settings/channels/ChannelsGeneral';
import BannerConfiguration from './view/settings/banner_configuration/index';
import NewBannerConfiguration from './view/settings/new_banner_configuration/index';
/*Reports */
import ReportsMain from './view/reports/dashboard/ReportsMain';
import ReportDailySales from './view/reports/dashboard/Sales/ReportDailySales';
import ReportSalesByMarket from './view/reports/dashboard/DailySalesByMarket/ReportSalesByMarket';
import ReportConsolidationCancel from './view/reports/dashboard/ConsolidationDailyCancellation/ReportConsolidationCancellation';
import ReportConsolidationSalesRoom from './view/reports/dashboard/ConsolidationSalesRooms/ReportConsolidationSalesRooms';
import ReportDailyReservations from './view/reports/dashboard/DailyReservations/ReportDailyReservations';
import ReportDailyCancellations from './view/reports/dashboard/DailyCancellations/ReportDailyCancellations';
import ReportBookingsOnHold from './view/reports/dashboard/BookingsOnHold/ReportBookingsOnHold';
import ReportConsolidationPromoCode from './view/reports/dashboard/ConsolidatedPromoCode/ReportConsolidationPromoCode';
import Reports from './view/reports/settings/index'

import Prueba from './components/CleverAssets/Prueba';
import MainSvg from './view/settings/uploadSVG/MainSvg';
import Cancelation from './view/property/policies/categories/Cancelation';
import MainSystem from './view/settings/systems/MainSystem';
import MainChannelsType from './view/settings/channelsType/MainChannelsType';

// const log = localStorage.getItem("username");
const log = true;

const AppRoutes = (props) =>
    <Switch>
        <Route exact path="/" component={() => (log ? <Dashboard/> : <Login sistema={props.sistema} />)} />
        <Route exact path="/login" component={() => <Login sistema={props.sistema} />} />
        {/* PROPERTY */}
        <Route exact path="/property/general" component={() => (log ? <><PropertiesHeader /><PropertyGeneral/></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/property/amenities" component={() => (log ? <><PropertiesHeader /><PropertyAmenities/></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/property/descriptions" component={() => (log ? <><PropertiesHeader/><MainDescription/></> : <Login sistema={props.sistema} />)} />
        <Route exact path="/property/room" component={() => (log ? <><PropertiesHeader /><MainRoom/></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/property/seasons" component={() => (log ? <><PropertiesHeader /><MainSeason /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/property/age_range" component={() => (log ? <><PropertiesHeader globalOption={true} /><PropertyAgeRange/></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/property/termsandconditions" component={() => <><PropertiesHeader /><TermsAndConditions/></>} />
        <Route exact path="/property/policies" component={() => (log ? <><PropertiesHeader globalOption={true}/><Policies/></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/property/policies/bookingpolicies" component={() => (log ? <><PropertiesHeader /><BookingGuarantees /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/property/policies/cancelation" component={() => (log ? <><PropertiesHeader /><Cancelation /></> : <Login sistema={props.sistema} />) } />
        {/* RATES */}
        <Route exact path="/rates/restrictions" component={() => (log ? <><PropertiesHeader globalOption={true} /><AccessRestrictionsGeneral /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/rates/services" component={() => (log ? <><PropertiesHeader /><Services /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/rates/crossout" component={() => (log ? <><PropertiesHeader globalOption={true} /><Crossout /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/rates/vouchers" component={() => (log ? <><PropertiesHeader globalOption={true}/><MainVouchers /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/rates/rate_plan" component={() => (log ? <><PropertiesHeader globalOption={true} /><RatePlanGeneral /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/rates/calendar" component={() => (log ? <><PropertiesHeader /><MainRateCalendar /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/rates/promotions/" component={() => (log ? <><PropertiesHeader globalOption={true} /><PromotionsMain /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/rates/disabledRoom" component={() => (log ? <><PropertiesHeader /><MainRoomDisabled /></> : <Login sistema={props.sistema} />) } />
        {/* CATALOGUE */}
        <Route exact path="/catalogue/countries-and-markets" component={() => (log ? <><PropertiesHeader globalOption={true} /><CountriesAndMarkets /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/catalogue/amenities" component={() => (log ? <><PropertiesHeader globalOption={true} /><AmenitiesMain /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/catalogue/configbooking" component={() => (log ? <><PropertiesHeader globalOption={true} /><ConfigBooking /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/property/gallery" component={() => (log ? <><PropertiesHeader globalOption={true} /><UploadGalllery /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/catalogue/currency" component={() => (log ? <><PropertiesHeader globalOption={true} /><Currency /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/catalogue/timezones" component={() => (log ? <><PropertiesHeader globalOption={true} /><TimeZones /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/catalogue/filters" component={() => (log ? <><PropertiesHeader globalOption={true} /><FilterMain /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/catalogue/brands" component={() => (log ? <><PropertiesHeader globalOption={true} /><Brands /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/catalogue/ex_change" component={() => (log ? <><PropertiesHeader globalOption={true} /><ExChange /></> : <Login sistema={props.sistema} />) } />
        
        {/* SETTINGS */}
        <Route exact path="/settings/pushrates" component={() => (log ? <><PropertiesHeader globalOption={true} /><PushRates /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/credentials" component={() => (log ? <><PropertiesHeader globalOption={true} /><Credentials /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/credentials/users" component={() => (log ? <><PropertiesHeader globalOption={true} /><Users /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/roles-and-permissions" component={() => (log ? <><PropertiesHeader globalOption={true} /><RolesAndPermissions /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/endpoint-permissions" component={() => (log ? <><PropertiesHeader globalOption={true} /><EndpointPermissions /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/upload-svg" component={() => (log ? <><PropertiesHeader globalOption={true} /><MainSvg /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/systems" component={() => (log ? <><PropertiesHeader globalOption={true} /><MainSystem /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/channels-type" component={() => (log ? <><PropertiesHeader globalOption={true} /><MainChannelsType /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/channels" component={() => (log ? <><PropertiesHeader globalOption={true} /><Channels /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/banner-configuration" component={() => (log ? <><PropertiesHeader globalOption={true} /><BannerConfiguration /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/settings/new-banner-configuration" component={() => (log ? <><PropertiesHeader globalOption={true} /><NewBannerConfiguration /></> : <Login sistema={props.sistema} />) } />

        {/**REPORTS */}        
        <Route exact path="/reports/" component={() => (log ? <><PropertiesHeader globalOption={true}/><ReportsMain /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/reports/dailySalesPoperty" component={() => (log ? <><PropertiesHeader globalOption={true}/><ReportDailySales /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/reports/dailySalesMarket" component={() => (log ? <><PropertiesHeader globalOption={true}/><ReportSalesByMarket /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/reports/consolidationCancellation" component={() => (log ? <><PropertiesHeader globalOption={true}/><ReportConsolidationCancel /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/reports/ConsolidationSalesRoom" component={() => (log ? <><PropertiesHeader globalOption={true}/><ReportConsolidationSalesRoom /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/reports/dailyReservations" component={() => (log ? <><PropertiesHeader globalOption={true}/><ReportDailyReservations /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/reports/dailyCancellation" component={() => (log ? <><PropertiesHeader globalOption={true}/><ReportDailyCancellations /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/reports/bookingsOnHold" component={() => (log ? <><PropertiesHeader globalOption={true}/><ReportBookingsOnHold /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/reports/consolidationPromoCode" component={() => (log ? <><PropertiesHeader globalOption={true}/><ReportConsolidationPromoCode /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/reports/settings" component={() => (log ? <><PropertiesHeader globalOption={true}/><Reports /></> : <Login sistema={props.sistema} />) } />

        {/* OPERATIONS */}
        <Route exact path="/operations/booking" component={() => (log ? <><PropertiesHeader globalOption={true}/><MainBooking /></> : <Login sistema={props.sistema} />) } />
        {/* GUEST */}
        <Route exact path="/guest/booking" component={() => (log ? <><PropertiesHeader globalOption={true}/><MainBookingList /></> : <Login sistema={props.sistema} />) } />
        <Route exact path="/rinkou" component={() => (log ? <><PropertiesHeader globalOption={true}/><Prueba /></> : <Login sistema={props.sistema} />) } />
        {/* 404 */}
        <Route component={NotFound} />
    </Switch>
;

export default AppRoutes;