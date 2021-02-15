import React, { Component } from "react";
import {
  CleverForm,
  Upload,
  CleverRequest,
  MComponentes,
  Card,
  Modal,
  Chip,
} from "clever-component-library";
import CleverConfig from "../../../../../config/CleverConfig";
import "./style.css";

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      brandOption: 0,
      deviceType: "",
      httpMethod: "",
      bannerType: "",
      bookingWindowStart: "",
      bookingWindowEnd: "",
      brands: [],
      properties: [],
      countries: [],
      languages: [],
      markets: [],
      dataInput: {},
      dataForm: {},
      bannerDesktop: {},
      bannerMobile: {},
      bannerTrade: {},
      bannerLetter: {},
      bannerDesktopImg: "",
      bannerMobileImg: "",
      bannerTradeImg: "",
      bannerLetterImg: "",
      bannerArray: [],
      pages: [
        { value: "home", option: "Home" },
        { value: "rooms", option: "Rooms" },
        { value: "services", option: "Services" },
        { value: "confirmation", option: "Confirmation" },
        { value: "payment", option: "Payment" },
        { value: "on_hold", option: "On hold" },
      ],
      bookingWindowOption: 1,
      bookingWindowOptions: [
        { value: 1, option: "No restrictions" },
        { value: 2, option: "Custom dates" },
        { value: 3, option: "Blackout dates" },
      ],
    };
  }

  refForm = React.createRef();
  refSelectBrand = React.createRef();
  refSelectProperty = React.createRef();
  refSelectLanguage = React.createRef();

  componentDidMount() {
    this.getBrands();
    this.getProperties();
    this.getCountries();
    this.getLanguages();
    this.getMarkets();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.httpMethod !== state.httpMethod) {
      return { httpMethod: props.httpMethod };
    }
    if (props.iddef_media_banners !== state.iddef_media_banners) {
      return { iddef_media_banners: props.iddef_media_banners };
    } else return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.httpMethod !== this.state.httpMethod) {
      this.setState({ httpMethod: this.props.httpMethod });
    }
    if (
      prevState.iddef_media_banners !== this.state.iddef_media_banners &&
      this.state.iddef_media_banners !== 0
    ) {
      this.getBannerByID(this.state.iddef_media_banners);
    }
  }

  getBannerByID = async (iddef_media_banners) => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") +
        `/api/media-banners/get/${iddef_media_banners}`,
      (response, error) => {
        if (!error) {
          let category = "",
            dataForm = {},
            datesToSetInChip = [];

          switch (response.data.type_banner) {
            case 1:
              category = "web";
              break;
            case 2:
              category = "letter";
              break;
            case 3:
              category = "ad";
              break;
          }

          dataForm = {
            iddef_media_banners: response.data.iddef_media_banners,
            media_name: response.data.name,
            order: response.data.order,
            language: response.data.lang_codes,
            pages: response.data.pages,
            market: response.data.marketing,
            geo_targeting: response.data.geo_targeting_countries,
            booking_window: response.data.booking_window,
            brand_option:
              response.data.brand_option == 0 ? 3 : response.data.brand_option,
            brand: response.data.brand_codes,
            property_name: response.data.property_codes,
            category: category,
            type_banner: response.data.type_banner.toString(),
            banners: response.data.ids_media,
            tags: response.data.tags,
          };

          response.data.ids_media.forEach((banner) => {
            switch (banner.category) {
              case "desktop":
                this.setState({ bannerDesktopImg: banner.url });
                response.data.type_banner === 3 &&
                  (dataForm.href_banner_desktop = banner.href_banner);
                break;
              case "mobile":
                this.setState({ bannerMobileImg: banner.url });
                break;
              case "trade":
                this.setState({ bannerTradeImg: banner.url });
                break;
              case "letter":
                this.setState({ bannerLetterImg: banner.url });
                response.data.type_banner === 3 &&
                  (dataForm.href_banner_letter = banner.href_banner);
                break;
            }
          });

          response.data.booking_window.forEach((element) => {
            datesToSetInChip.push(
              element.start_date + " / " + element.end_date
            );
          });

          this.setState({
            load: false,
            dataForm: dataForm,
            bannerType: response.data.type_banner,
          });
          this.setValueChip(datesToSetInChip);
        }
      }
    );
  };

  getLanguages = () => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + "/api/language/get",
      (response, error) => {
        if (!error) {
          let languages = [];
          response.data.map((data) => {
            languages.push({ value: data.lang_code, option: data.description });
          });
          this.setState({ languages: languages });
          this.setState({ load: false });
        }
      }
    );
  };

  getMarkets = () => {
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + `/api/market/get?all=1`,
      (response, error) => {
        if (response.status === 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          this.setState({ load: false });
          return;
        }
        if (!error) {
          let markets = [{ value: 0, option: "ALL MARKETS" }];
          response.data.map((data) => {
            if (data.estado === 1) {
              markets.push({
                value: data.iddef_market_segment,
                option: data.code,
              });
            }
          });
          this.setState({ markets: markets, load: false });
        }
      }
    );
  };

  handleSelectedMarkets = (data) => {
    let selectedMarkets = data !== undefined ? data.values : [];
    if (selectedMarkets.length != 0) {
      selectedMarkets.forEach((market) => {
        CleverRequest.get(
          CleverConfig.getApiUrl("bengine") +
            `/api/country/get?market=${market}`,
          (response, error) => {
            if (response.status === 403) {
              MComponentes.toast("YOU ARE NOT AUTHORIZED");
              return;
            }
            if (!error) {
              let options = [];
              response.data.map((data, index) => {
                if (data.estado === 1) {
                  options.push({
                    value: response.data[index].iddef_country,
                    option: response.data[index].name,
                  });
                }
              });
              this.setState({ countries: options });
            } else console.log(error);
          }
        );
      });
    } else this.getCountries();
  };

  getCountries = () => {
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + `/api/country/get?all=1`,
      (response, error) => {
        if (response.status === 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          this.setState({ load: false });
          return;
        }
        if (!error) {
          let options = [];
          response.data.map((data, index) => {
            if (data.estado === 1) {
              options.push({
                value: response.data[index].iddef_country,
                option: response.data[index].name,
              });
            }
          });
          this.setState({ countries: options, load: false });
        }
      }
    );
  };

  getBrands = () => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + "/api/brand/get",
      (response, error) => {
        if (!error) {
          let brands = [];
          response.data.map((data) => {
            if (data.estado === 1) {
              brands.push({ value: data.code, option: data.name });
            }
          });
          this.setState({ brands: brands });
          this.setState({ load: false });
        }
      }
    );
  };

  getProperties = () => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + "/api/property/get?all/",
      (response, error) => {
        if (!error) {
          let properties = [];
          response.data.map((data) => {
            if (data.estado === 1) {
              properties.push({
                value: data.property_code,
                option: data.short_name,
              });
            }
          });
          this.setState({ properties: properties });
          this.setState({ load: false });
        }
      }
    );
  };

  mediaHandler = (deviceType, dataBucket) => {
    let genericSaver = {
      iddef_media: 0,
      iddef_media_type: 1,
      iddef_media_group: 10,
      url: dataBucket.data.objectURL,
      description: `Banner ${this.state.dataInput.media_name} for ${this.state.bannerType}`,
      nombre_bucket: dataBucket.data.bucket,
      bucket_type: 1,
      etag: dataBucket.data.ETag,
      show_icon: 0,
      name: dataBucket.data.nameFile,
      tags: {
        tags: [""],
      },
      category: deviceType,
    };

    switch (deviceType) {
      case "desktop":
        this.setState({ bannerDesktop: genericSaver });
        break;
      case "mobile":
        this.setState({ bannerMobile: genericSaver });
        break;
      case "trade":
        this.setState({ bannerTrade: genericSaver });
        break;
      case "letter":
        this.setState({ bannerLetter: genericSaver });
        break;
    }
    this.closeModal();
  };

  validateForm = (e) => {
    let requiredCount = this.refForm.getData().required.count,
      _dataInput = this.refForm.getData().values,
      order = _dataInput.order;

    if (requiredCount === 0 && order > 0) {
      this.setState({ dataInput: _dataInput }, () => this.callBack());
    } else if (order === 0) {
      MComponentes.toast("Order must be greater than 0");
    } else {
      MComponentes.toast("Complete the data required");
    }
  };

  callBack = async (dataBucket) => {
    let dataToSave = {},
      category = "",
      bannerArray = [],
      valueChip = this.getValueChip(),
      bookingWindowDates = [],
      brand_option = parseInt(this.state.dataInput.brand_option);

    switch (this.state.bannerType) {
      case "1":
        category = "web";

        bannerArray.push(
          JSON.stringify(this.state.bannerDesktop) !== "{}"
            ? this.state.bannerDesktop
            : this.state.dataForm.banners[0],
          JSON.stringify(this.state.bannerMobile) !== "{}"
            ? this.state.bannerMobile
            : this.state.dataForm.banners[1],
          JSON.stringify(this.state.bannerTrade) !== "{}"
            ? this.state.bannerTrade
            : this.state.dataForm.banners[2]
        );

        if (bannerArray != []) {
          let href_banner = "";
          bannerArray.forEach((element) => {
            switch (element.category) {
              case "desktop":
                href_banner = this.state.dataInput.href_banner_desktop;
                break;
              case "mobile":
                href_banner = this.state.dataInput.href_banner_mobile;
              case "trade":
                href_banner = this.state.dataInput.href_banner_trade;
                break;
            }
            // If it is empty or differs from current storaged value
            (href_banner !== "" || href_banner !== href_banner) &&
              Object.assign(element, { href_banner: href_banner });
          });
        }
        break;
      case "2":
        category = "letter";
        bannerArray.push(this.state.bannerLetter);
        break;
      case "3":
        category = "ad";

        JSON.stringify(this.state.bannerDesktop) !== "{}" &&
        JSON.stringify(this.state.bannerLetter) !== "{}"
          ? bannerArray.push(this.state.bannerDesktop, this.state.bannerLetter)
          : (bannerArray = this.state.dataForm.banners);

        if (bannerArray != []) {
          let href_banner = "";
          bannerArray.forEach((element) => {
            switch (element.category) {
              case "desktop":
                href_banner = this.state.dataInput.href_banner_desktop;
                break;
              case "letter":
                href_banner = this.state.dataInput.href_banner_letter;
                break;
            }
            href_banner !== "" &&
              Object.assign(element, { href_banner: href_banner });
          });
        }
        break;
    }

    // Get date formated as YYYY-MM-DD from chip values
    valueChip.forEach((element, index) => {
      bookingWindowDates.push({
        start_date: element.slice(0, 10),
        end_date: element.slice(-10),
      });
    });

    switch (this.state.httpMethod) {
      case "POST":
        dataToSave = {
          estado: 1,
          name: this.state.dataInput.media_name,
          order: this.state.dataInput.order,
          lang_option: this.state.dataInput.language.length === 2 ? 0 : 1,
          lang_codes: this.state.dataInput.language || [],
          pages: this.state.dataInput.pages || [],
          market_option: this.state.dataInput.market.length === 0 ? 0 : 1,
          marketing: this.state.dataInput.market || [],
          geo_targeting_option:
            this.state.dataInput.geo_targeting.length === 0 ? 0 : 1,
          geo_targeting_countries: this.state.dataInput.geo_targeting || [],
          type_banner: parseInt(this.state.dataInput.type_banner),
          brand_option: brand_option === 3 ? 0 : brand_option,
          brand_codes: brand_option === 2 ? this.state.dataInput.brand : [],
          property_codes:
            brand_option === 3 ? this.state.dataInput.property_name : [],
          category: category,
          data_media: bannerArray,
          booking_window_option: this.state.bookingWindowOption,
          booking_window: bookingWindowDates || [],
        };
        this.saveData(dataToSave);
        break;
      case "PUT":
        dataToSave = {
          iddef_media_banners: this.state.iddef_media_banners,
          estado: 1,
          name: this.state.dataInput.media_name,
          order: this.state.dataInput.order,
          lang_option: this.state.dataInput.language.length === 2 ? 0 : 1,
          lang_codes: this.state.dataInput.language || [],
          pages: this.state.dataInput.pages || [],
          market_option: this.state.dataInput.market.length === 0 ? 0 : 1,
          marketing: this.state.dataInput.market || [],
          geo_targeting_option:
            this.state.dataInput.geo_targeting.length === 0 ? 0 : 1,
          geo_targeting_countries: this.state.dataInput.geo_targeting || [],
          type_banner: parseInt(this.state.dataInput.type_banner),
          brand_option: brand_option === 3 ? 0 : brand_option,
          brand_codes: brand_option === 2 ? this.state.dataInput.brand : [],
          property_codes:
            brand_option === 3 ? this.state.dataInput.property_name : [],
          category: category,
          data_media: bannerArray,
          booking_window_option: this.state.bookingWindowOption,
          booking_window: bookingWindowDates || [],
        };
        this.editData(dataToSave);
        break;
    }
  };

  saveData = (dataToSave) => {
    CleverRequest.post(
      CleverConfig.getApiUrl("bengine") + "/api/media-banners/create",
      dataToSave,
      (data, error) => {
        if (!error) {
          let notificationType = "",
            notificationMessage = "";
          if (!data.Error) {
            notificationMessage = "The data was saved";
            notificationType = "success";
            this.props.formHandler("close");
          } else {
            notificationType = "error";
            notificationMessage = "The data was not saved";
          }
          MComponentes.toast(notificationMessage);
          this.setState({
            notificationMessage: notificationMessage,
            notificationType: notificationType,
          });
        } else console.log(error);
      }
    );
  };

  editData = (dataToSave) => {
    CleverRequest.put(
      CleverConfig.getApiUrl("bengine") + "/api/media-banners/update",
      dataToSave,
      (data, error) => {
        if (!error) {
          let notificationType = "",
            notificationMessage = "";
          if (!data.Error) {
            notificationType = "success";
            notificationMessage = "The data was saved";
            this.props.formHandler("close");
          } else {
            notificationType = "error";
            notificationMessage = "The data was not saved";
          }
          MComponentes.toast(notificationMessage);
          this.setState({
            notificationMessage: notificationMessage,
            notificationType: notificationType,
          });
        } else console.log(error);
      }
    );
  };

  onChangeBrandOption = (data) => {
    return this.setState({ brandOption: data.value == 3 ? 0 : data.value });
  };

  onChangeBannerType = (data) => {
    return this.setState({ bannerType: data.value });
  };

  openModal = (e, deviceType) => {
    this.setState({ deviceType: deviceType });
    this.refModal.getInstance().open();
  };

  closeModal = (e, deviceType) => {
    this.setState({ deviceType: "" });
    this.refModal.getInstance().close();
  };

  bookingWindowOptionHandler = (option) => {
    return this.setState({ bookingWindowOption: parseInt(option.value) });
  };

  bookingWindowHandler = (date, bookingWindowType) => {
    switch (bookingWindowType) {
      case "start":
        this.setState({ bookingWindowStart: date.dateString });
        break;
      case "end":
        this.setState({ bookingWindowEnd: date.dateString });
        break;
    }
  };

  addBookingWindow = () => {
    let bookingWindowRange = {
      start: this.state.bookingWindowStart,
      end: this.state.bookingWindowEnd,
    };

    this.setValueChip(
      `${bookingWindowRange.start} / ${bookingWindowRange.end}`
    );
  };

  render() {
    let { deviceType, bannerType } = this.state;
    return (
      <div className="row">
        <Modal
          onRef={(modal) => (this.refModal = modal)}
          defaultButton={{ buttonClass: "d-none" }}
          title={{
            text: `${
              deviceType !== "" &&
              deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
            } media`,
          }}
        >
          <Upload
            acceptType={true}
            onRef={(fileUpload) => (this.refupload = fileUpload)}
            bucket="booking_engine"
            mode="admin"
            pyApi={true}
            urlServiceUploadBucket={
              CleverConfig.getApiUrl("apiAssetsPy") + "/s3upload"
            }
            acceptTypeContent={[{ acceptType: "image/*" }]}
            callBack={this.mediaHandler.bind(this, deviceType)}
          />
        </Modal>
        <CleverForm
          id="form-bannerConfiguration"
          ref={(ref) => (this.refForm = ref)}
          data={this.state.dataForm}
          forms={[
            {
              inputs: [
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div className="row">
                            <div className="col s12 m12 l12 form-section-title">
                              General
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      type: "text",
                      size: "col s12 m6 l3",
                      name: "media_name",
                      label: "Name *",
                      alphanumeric: true,
                      characters: true,
                      required: true,
                    },
                    {
                      type: "number",
                      size: "col s12 m6 l3",
                      name: "order",
                      label: "Order *",
                      required: true,
                    },
                    {
                      type: "select",
                      multiple: true,
                      size: "col s12 m6 l3",
                      name: "language",
                      label: "Language *",
                      autocomplete: true,
                      required: true,
                      options: this.state.languages,
                    },
                    {
                      type: "select",
                      multiple: true,
                      size: "col s12 m6 l3",
                      name: "pages",
                      label: "Pages",
                      autocomplete: true,
                      options: this.state.pages,
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "select",
                      multiple: true,
                      size: "col s12 m6 l6",
                      name: "market",
                      label: "market",
                      autocomplete: true,
                      options: this.state.markets,
                      onChange: (data) => this.handleSelectedMarkets(data),
                    },
                    {
                      type: "select",
                      multiple: true,
                      size: "col s12 m6 l6",
                      name: "geo_targeting",
                      label: "geo targeting",
                      autocomplete: true,
                      uppercase: false,
                      options: this.state.countries,
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div className="row">
                            <div className="col s12 m12 l12 form-section-title">
                              Booking window
                            </div>
                          </div>
                        );
                      },
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "select",
                      multiple: false,
                      size: "col s12 m4 l4",
                      name: "booking_window_option",
                      label: "booking window option",
                      autocomplete: true,
                      uppercase: false,
                      options: this.state.bookingWindowOptions,
                      onChange: (option) =>
                        this.bookingWindowOptionHandler(option),
                    },
                    {
                      type: "date",
                      colDate: "col s12 m3 l3",
                      name: "booking_window_start",
                      labelDate: "booking window start",
                      placeholder: "booking window start",
                      disabled:
                        this.state.bookingWindowOption === 1 ? true : false,
                      onChange: (date) =>
                        this.bookingWindowHandler(date, "start"),
                    },
                    {
                      type: "date",
                      colDate: "col s12 m3 l3",
                      name: "booking_window_end",
                      labelDate: "booking window end",
                      placeholder: "booking window end",
                      disabled:
                        this.state.bookingWindowOption === 1 ? true : false,
                      onChange: (date) =>
                        this.bookingWindowHandler(date, "end"),
                    },
                    {
                      type: "button",
                      label: "add",
                      size: "col s12 m2 l2",
                      disabled:
                        this.state.bookingWindowOption === 1 ? true : false,
                      onClick: () => this.addBookingWindow(),
                      icon: "add",
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div className="col s12 m12 l12">
                            <Chip
                              id="booking-window-chip"
                              readOnly={true}
                              setValue={(set) => {
                                this.setValueChip = set;
                              }}
                              getValue={(get) => {
                                this.getValueChip = get;
                              }}
                              cleanValue={(clean) => {
                                this.cleanValueChip = clean;
                              }}
                              label={{ t: "Dates", d: "{{'DATES'}}" }}
                            />
                          </div>
                        );
                      },
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div className="row">
                            <div className="col s12 m12 l12 form-section-title">
                              Channels *
                            </div>
                          </div>
                        );
                      },
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "radio",
                      size: "col s12 m12 l12 channel-radiobuttons",
                      name: "brand_option",
                      onChange: (data) => this.onChangeBrandOption(data),
                      radios: [
                        { value: 1, label: "Consolidado" },
                        { value: 2, label: "Brand" },
                        { value: 3, label: "Property" },
                      ],
                    },
                  ],
                },
                this.state.brandOption == 2
                  ? {
                      row: [
                        {
                          type: "select",
                          multiple: true,
                          size: "col s12 m12 l12",
                          name: "brand",
                          label: "brand",
                          autocomplete: true,
                          uppercase: false,
                          options: this.state.brands,
                        },
                      ],
                    }
                  : {
                      row: [],
                    },
                this.state.brandOption == "" || this.state.brandOption == 3
                  ? {
                      row: [
                        {
                          type: "select",
                          multiple: true,
                          size: "col s12 m12 l12",
                          name: "property_name",
                          label: "property",
                          autocomplete: true,
                          uppercase: false,
                          options: this.state.properties,
                        },
                      ],
                    }
                  : {
                      row: [],
                    },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div className="row">
                            <div className="col s12 m12 l12 form-section-title">
                              Banner type *
                            </div>
                          </div>
                        );
                      },
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "radio",
                      size: "col s12 m12 l12 channel-radiobuttons",
                      name: "type_banner",
                      onChange: (data) => this.onChangeBannerType(data),
                      radios: [
                        { value: 1, label: "Web" },
                        { value: 2, label: "Letter" },
                        { value: 3, label: "Ad" },
                      ],
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "text",
                      size: "col s12 m4 l4",
                      name: "href_banner_desktop",
                      label: "URL desktop *",
                      placeholder: "Insert URL for desktop banner",
                      alphanumeric: true,
                      characters: true,
                      required: bannerType == 3 ? true : false,
                      hidden: bannerType != 3 ? true : false,
                    },
                    {
                      type: "text",
                      size: "col s12 m4 l4",
                      name: "href_banner_letter",
                      label: "URL letter *",
                      placeholder: "Insert URL for letter banner",
                      alphanumeric: true,
                      characters: true,
                      required: bannerType == 3 ? true : false,
                      hidden: bannerType != 3 ? true : false,
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <>
                            {bannerType == 1 && (
                              <>
                                <div className="col s12 m4 l4">
                                  <Card
                                    title={{
                                      default: "Desktop",
                                      data_il8n: "{{'DESKTOP}}",
                                    }}
                                    isPanel={false}
                                    action={
                                      <a
                                        onClick={(e) =>
                                          this.openModal(e, "desktop")
                                        }
                                      >
                                        upload
                                        <i className="material-icons right">
                                          file_upload
                                        </i>
                                      </a>
                                    }
                                    image={{ src: this.state.bannerDesktopImg }}
                                  />
                                </div>
                                <div className="col s12 m4 l4">
                                  <Card
                                    title={{
                                      default: "Mobile",
                                      data_il8n: "{{'MOBILE}}",
                                    }}
                                    isPanel={false}
                                    action={
                                      <a
                                        onClick={(e) =>
                                          this.openModal(e, "mobile")
                                        }
                                      >
                                        upload
                                        <i className="material-icons right">
                                          file_upload
                                        </i>
                                      </a>
                                    }
                                    image={{ src: this.state.bannerMobileImg }}
                                  />
                                </div>
                                <div className="col s12 m4 l4">
                                  <Card
                                    title={{
                                      default: "Trade",
                                      data_il8n: "{{TRADE}}",
                                    }}
                                    isPanel={false}
                                    action={
                                      <a
                                        onClick={(e) =>
                                          this.openModal(e, "trade")
                                        }
                                      >
                                        upload
                                        <i className="material-icons right">
                                          file_upload
                                        </i>
                                      </a>
                                    }
                                    image={{ src: this.state.bannerTradeImg }}
                                  />
                                </div>
                              </>
                            )}
                            {bannerType == 2 && (
                              <>
                                <div className="col s12 m4 l4">
                                  <Card
                                    title={{
                                      default: "Letter",
                                      data_il8n: "{{LETTER}}",
                                    }}
                                    isPanel={false}
                                    action={
                                      <a
                                        onClick={(e) =>
                                          this.openModal(e, "letter")
                                        }
                                      >
                                        upload
                                        <i className="material-icons right">
                                          file_upload
                                        </i>
                                      </a>
                                    }
                                    image={{ src: this.state.bannerLetterImg }}
                                  />
                                </div>
                              </>
                            )}
                            {bannerType == 3 && (
                              <>
                                <div className="col s12 m4 l4">
                                  <Card
                                    title={{
                                      default: "Desktop",
                                      data_il8n: "{{'DESKTOP}}",
                                    }}
                                    isPanel={false}
                                    action={
                                      <a
                                        onClick={(e) =>
                                          this.openModal(e, "desktop")
                                        }
                                      >
                                        upload
                                        <i className="material-icons right">
                                          file_upload
                                        </i>
                                      </a>
                                    }
                                    image={{ src: this.state.bannerDesktopImg }}
                                  />
                                </div>
                                <div className="col s12 m4 l4">
                                  <Card
                                    title={{
                                      default: "Letter",
                                      data_il8n: "{{LETTER}}",
                                    }}
                                    isPanel={false}
                                    action={
                                      <a
                                        onClick={(e) =>
                                          this.openModal(e, "letter")
                                        }
                                      >
                                        upload
                                        <i className="material-icons right">
                                          file_upload
                                        </i>
                                      </a>
                                    }
                                    image={{ src: this.state.bannerLetterImg }}
                                  />
                                </div>
                              </>
                            )}
                          </>
                        );
                      },
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "button",
                      label: "save",
                      size: "col s12 m2 l2 offset-m10 offset-l10",
                      onClick: () => this.validateForm(),
                      icon: "save",
                    },
                  ],
                },
              ],
            },
          ]}
        />
      </div>
    );
  }
}
