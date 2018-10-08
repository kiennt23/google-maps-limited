import {html, LitElement} from '@polymer/lit-element';
window.initMap = function () { window.dispatchEvent(new CustomEvent('google-map-ready')); }; // eslint-disable-line no-unused-vars

/**
 * `google-maps-limited`
 * A limited use case of google maps with clickable markers.
 *
 * @customElement
 * @demo demo/index.html
 */
class GoogleMapsLimited extends LitElement {
  
  static get properties() {
    return {
      apiKey: {type: String},
      lang: {
        type: String,
        value: "en"
      },
      inChina: {
        type: Boolean,
        value: false
      },
      markers: {
        type: Object
      }
    };
  }
  render() {
    return html`
      <style>
        :host {
          display: block
        }
        #map {
          width: 100%;
          height: 100%;
        }
      </style>
      <div id="map"></div>
    `;
  }

  constructor() {
    super();
    // _mapScriptTag sets up and the google maps loader script tag - we inject it here
    // and after it loads it will fire the google-map-ready event  
    window.addEventListener('google-map-ready', () => {
      this._mapRef = new google.maps.Map(this.shadowRoot.querySelector('#map'), {
        center: { lat: 40, lng: -112 },
        zoom: 5,
        streetViewControl: false,
      });
      this._putMarkersOnMap(this._markers);
    });
  }

  firstUpdated() {
    this.shadowRoot.appendChild(this._mapScriptTag());
    super.firstUpdated();
  }

  _mapScriptTag() {
    const lang = 'en'
    // init google maps
    const googleMapsLoader = document.createElement('script');
    googleMapsLoader.src = `https://maps.${this.inChina ? 'google.cn' : 'googleapis.com'}/maps/api/js?key=${this.apiKey}&language=${lang === 'zh' ? 'zh-TW' : lang}&callback=initMap`;
    googleMapsLoader.async = true;
    googleMapsLoader.defer = true;
    return googleMapsLoader;
  }

  set markers(markers) {
    if(!markers) return;
    this._putMarkersOnMap(markers);
    this._markers = markers;
  }
  
  get markers() {
    return this._markers;
  }

  _putMarkersOnMap(markers) {
    if(!this._mapRef || !markers) return;
    this._mapMarkers = markers.reduce((acc, item) => {
      if(item.position){
        acc.push(new google.maps.Marker({
          position: item.position,
          map: this._mapRef
        }));
        return acc;
      }
      return acc;
    }, []);
    this._setDefaultBounds ();
  }

  _setDefaultBounds () {
    if (this._markers.length === 0) {
      // show the whole world if there are no markers
      var worldBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(70.4043, -143.5291), // Top-left
        new google.maps.LatLng(-46.11251, 163.4288) // Bottom-right
      );
      this._mapRef.fitBounds(worldBounds, 0);
    } else {
      var initialBounds = this._mapMarkers.reduce((bounds, marker) => {
        bounds.extend(marker.getPosition());
        return bounds;
      }, new google.maps.LatLngBounds());
      this._mapRef.fitBounds(initialBounds);
    }
  }
}

window.customElements.define('google-maps-limited', GoogleMapsLimited);
