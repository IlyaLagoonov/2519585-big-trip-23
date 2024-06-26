import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import he from 'he';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import {EVENT_TYPES, EditType, POINT_EMPTY} from '../const.js';
import {capitalizeFirstLetter, formatStringToDelimiterDate} from '../utils.js';

const createTypesListTemplate = (currentType) => {
  const typeListMarkup = EVENT_TYPES.reduce((markup, type)=>`${markup}
  <div class="event__type-item">
    <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${(type === currentType) ? 'checked' : ''}>
    <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${capitalizeFirstLetter(type)}</label>
  </div>`, '');

  return `
  <div class="event__type-wrapper">
    <label class="event__type  event__type-btn" for="event-type-toggle-1">
      <span class="visually-hidden">Choose event type</span>
      <img class="event__type-icon" width="17" height="17" src="img/icons/${currentType}.png" alt="Event type icon">
    </label>
    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
    <div class="event__type-list">
      <fieldset class="event__type-group">
        <legend class="visually-hidden">Event type</legend>
        ${typeListMarkup}
      </fieldset>
    </div>
  </div>
  `;
};

const createOffersTemplate = (offers, pointOffers) => {
  const offersMarkup = offers.reduce((markup, {id, title, price})=>`${markup}
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${he.encode(id)}-1" type="checkbox" name="event-offer-${he.encode(id)}" data-offer-id="${he.encode(id)}" ${pointOffers.find((offer)=>offer === id) ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${he.encode(id)}-1">
        <span class="event__offer-title">${he.encode(title)}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${he.encode(String(price))}</span>
      </label>
    </div>`, '');
  if (offers.length) {
    return `
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
      ${offersMarkup}
      </div>
    </section>
    `;
  }
  return '';
};

const createDestinationPhotosTemplate = (destinations) => {
  const picturesMarkup = destinations?.pictures.reduce((markup, {src, description})=>`${markup}
  <img class="event__photo" src="${he.encode(src)}" alt="${he.encode(description)}">`, '');

  if (destinations?.pictures.length) {
    return `
    <div class="event__photos-container">
      <div class="event__photos-tape">
      ${picturesMarkup}
      </div>
    </div>
    `;
  }
  return '';
};

const createDestinationTemplate = (destination) => destination ?
  `<section class="event__section  event__section--destination">
    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
    <p class="event__destination-description">${he.encode(destination.description)}</p>
    ${createDestinationPhotosTemplate(destination)}
  </section>` : '';

const createButtonTemplate = (isCreating, isDeleting, isDisabled) => {
  if (isCreating) {
    return `
      <button class="event__reset-btn" type="reset">Cancel</button>
    `;
  }
  return `
    <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>${isDeleting ? 'Deleting...' : 'Delete'}</button>
    <button class="event__rollup-btn" type="button"><span class="visually-hidden">Open event</span></button>
    `;
};

const createPointEditorTemplate = ({
  state,
  pointDestinations,
  pointOffers,
  editorMode
}) => {
  const {
    type,
    basePrice,
    dateFrom,
    dateTo,
    offers
  } = state.point;

  const {
    isDisabled,
    isSaving,
    isDeleting
  } = state;

  const isCreating = editorMode === EditType.CREATING;
  const currentDestination = pointDestinations.find(({id}) => id === state.point.destination);
  const currentPointOffers = pointOffers.find((offer) => offer.type === type)?.offers;
  const listCities = pointDestinations.map(({name}) => he.encode(name));
  const createCitiesTemplate = (cities) => cities.reduce((markup, city)=>`${markup}<option value="${he.encode(city)}"></option>`, '');

  return `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          ${createTypesListTemplate(he.encode(type))}

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${capitalizeFirstLetter(he.encode(type))}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination ? he.encode(currentDestination.name) : ''}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${createCitiesTemplate(listCities)}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${isCreating ? '' : formatStringToDelimiterDate(dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${isCreating ? '' : formatStringToDelimiterDate(dateTo)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="number" pattern="^\\d+$" name="event-price" value="${he.encode(String(basePrice))}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
          ${createButtonTemplate(isCreating, isDeleting, isDisabled)}

        </header>
        <section class="event__details">
          ${currentPointOffers ? createOffersTemplate(currentPointOffers, offers) : ''}
          ${createDestinationTemplate(currentDestination)}
        </section>
      </form>
    </li>`;
};

export default class PointEditorView extends AbstractStatefulView {
  #pointDestinations = null;
  #pointOffers = null;
  #onCloseClick = null;
  #onFormSubmit = null;
  #onDeleteClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #editorMode;

  constructor({
    point = POINT_EMPTY,
    pointDestinations,
    pointOffers,
    onCloseClick,
    onDeleteClick,
    onFormSubmit,
    editorMode = EditType.EDITING
  }) {
    super();
    this.#pointDestinations = pointDestinations;
    this.#pointOffers = pointOffers;
    this.#onCloseClick = onCloseClick;
    this.#onDeleteClick = onDeleteClick;
    this.#onFormSubmit = onFormSubmit;
    this.#editorMode = editorMode;

    this._setState(PointEditorView.parsePointToState({point}));
    this._restoreHandlers();
  }

  get template() {
    return createPointEditorTemplate({
      state: this._state,
      pointDestinations: this.#pointDestinations,
      pointOffers: this.#pointOffers,
      editorMode: this.#editorMode,
    });
  }

  reset = (point) => this.updateElement({point});

  removeElement = () => {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  };

  _restoreHandlers = () => {
    if(this.#editorMode === EditType.EDITING) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeClickHandler);
      this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
    }
    if(this.#editorMode === EditType.CREATING) {
      this.element.querySelector('.event__reset-btn').addEventListener('click', this.#closeClickHandler);
    }
    this.element.querySelector('.event.event--edit').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__available-offers')?.addEventListener('change', this.#offerChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceChangeHandler);
    this.#setDatepickers();
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#onCloseClick();
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#onFormSubmit(PointEditorView.parseStateToPoint(this._state));
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#onDeleteClick(this._state.point);
  };

  #typeChangeHandler = (evt) => {
    this.updateElement({
      point: {
        ...this._state.point,
        type: evt.target.value,
        offers: []
      }
    });
  };

  #destinationChangeHandler = (evt) => {
    const currentDestination = this.#pointDestinations.find((pointDestination) => pointDestination.name === evt.target.value);
    const currentDestinationId = currentDestination ? currentDestination.id : null;

    this.updateElement({
      point: {
        ...this._state.point,
        destination: currentDestinationId
      }
    });
  };

  #offerChangeHandler = () => {
    const checkedOffers = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'));

    this._setState({
      point: {
        ...this._state.point,
        offers: checkedOffers.map((item) => item.dataset.offerId)
      }
    });
  };

  #priceChangeHandler = (evt) => {
    this._setState({
      point: {
        ...this._state.point,
        basePrice: evt.target.valueAsNumber
      },
    });
  };

  #setDatepickers = () => {
    const startDateNode = this.element.querySelector('.event__input--time[name="event-start-time"]');
    const endDateNode = this.element.querySelector('.event__input--time[name="event-end-time"]');
    const flatpickrConfig = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      locale: {
        firstDayOfWeek: 1,
      },
      'time_24hr': true
    };

    this.#datepickerFrom = flatpickr(startDateNode, {
      ...flatpickrConfig,
      defaultDate: this._state.point.dateFrom,
      onClose: this.#startDateCloseHandler,
      maxDate: this._state.point.dateTo
    });

    this.#datepickerTo = flatpickr(endDateNode, {
      ...flatpickrConfig,
      defaultDate: this._state.point.dateTo,
      onClose: this.#endDateCloseHandler,
      minDate: this._state.point.dateFrom
    });
  };

  #startDateCloseHandler = ([enteredDate]) => {
    this._setState({
      point:{
        ...this._state.point,
        dateFrom: enteredDate
      }
    });
    this.#datepickerTo.set('minDate', this._state.point.dateFrom);
  };

  #endDateCloseHandler = ([enteredDate]) => {
    this._setState({
      point:{
        ...this._state.point,
        dateTo: enteredDate
      }
    });
    this.#datepickerFrom.set('maxDate', this._state.point.dateTo);
  };

  static parsePointToState = ({
    point,
    isDisabled = false,
    isSaving = false,
    isDeleting = false,
  }) => ({
    point,
    isDisabled,
    isSaving,
    isDeleting,});

  static parseStateToPoint = (state) => (state.point);
}
