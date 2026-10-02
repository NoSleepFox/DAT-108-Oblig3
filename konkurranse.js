"use strict";

class KonkurranseController {
  #tabellelement;

  /**
   * @param {HTMLFormElement} formelement
   * @param {HTMLTableElement} tabellelement
   */
  constructor(formelement, tabellelement) {
    formelement.addEventListener("submit", (event) => this.#registrer(event));

    this.#tabellelement = tabellelement;

    const startnummerInput = formelement.elements["startnummer"];
    startnummerInput.addEventListener("input", (event) =>
      this.#validerStartnummer(event.target),
    );

    const navnInput = formelement.elements["navn"];
    navnInput.addEventListener("input", (event) =>
      this.#validerNavn(event.target),
    );

    this.#tabellelement.tBodies[0].addEventListener("input", (event) => {
      if (event.target.matches("input[type='time']")) {
        const rad = event.target.closest("tr");
        this.#validerTid(rad.querySelector(".sluttid"));
        this.#oppdaterLopstid(rad);
      }
    });

    this.#fyllListe();
    this.#validerStartnummer(startnummerInput);
  }

  /**
   * Legger til ny deltager med data last fra form-skjema
   *
   * @param {SubmitEvent} event
   */
  #registrer(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const deltager = {
      startnummer: Number(formData.get("startnummer")),
      navn: formData.get("navn"),
    };

    this.#visDeltager(deltager);
    event.target.reset();
  }

  /**
   * Validerer verdi i INPUT felt for startnummer for ny deltager
   *
   * @param {HTMLInputElement} target
   */
  #validerStartnummer(target) {
    console.log(target.validity);

    let errormessage;
    if (this.#startnummerFinnes(target.valueAsNumber)) {
      errormessage = "Startnummer er i bruk";
    } else if (target.validity.valueMissing) {
      errormessage = "Startnummer er påkrevd";
    } else {
      errormessage = "";
    }
    target.setCustomValidity(errormessage);
    target.title = errormessage; // For Chromium baserte nettlesere
  }

  /**
   * Validerer verdi i INPUT felt for navn for ny deltager
   *
   * @param {HTMLInputElement} target
   */
  #validerNavn(target) {
    console.log(target.validity);

    let errormessage;
    if (target.validity.patternMismatch) {
      errormessage =
        "Navn må bestå av ett eller flere delnavn skilt av mellomrom eller bindestrek og hvert delnavn må starte med stor forbokstav etterfulgt av kun små bokstaver";
    } else if (target.validity.valueMissing) {
      errormessage = "Navn mangler";
    } else if (target.validity.customError) {
      errormessage = "";
    }
    target.setCustomValidity(errormessage);
    target.title = errormessage; // For Chromium baserte nettlesere
  }

  #validerTid(target) {
    const rad = target.closest("tr");
    const startInput = rad.querySelector(".starttid");

    let errormessage = "";
    if (target.value !== "" && startInput.value !== "") {
      if (target.value <= startInput.value) {
        errormessage = "Sluttid må være etter starttid";
      }
    }
    target.setCustomValidity(errormessage);
    target.title = errormessage; // For Chromium baserte nettlesere
  }

  #oppdaterLopstid(rad) {
    const startInput = rad.querySelector(".starttid");
    const sluttInput = rad.querySelector(".sluttid");
    const lopstidCelle = rad.cells[4];

    lopstidCelle.textContent = "";
    if (startInput.value !== "" && sluttInput.value !== "") {
      const start = this.#tidTilSekunder(startInput.value);
      const slutt = this.#tidTilSekunder(sluttInput.value);

      if (slutt > start) {
        lopstidCelle.textContent = this.#sekunderTilTid(slutt - start);
      }
    }
  }

  #tidTilSekunder(tid) {
    const [timer, minutter, sekunder = 0] = tid.split(":").map(Number);
    return timer * 3600 + minutter * 60 + sekunder;
  }

  #sekunderTilTid(totalSekunder) {
    const timer = Math.floor(totalSekunder / 3600);
    const minutter = Math.floor((totalSekunder % 3600) / 60);
    const sekunder = totalSekunder % 60;

    return [timer, minutter, sekunder]
      .map((tall) => String(tall).padStart(2, "0"))
      .join(":");
  }

  /**
   * Viser deltager i deltagerlisten plassert mhp. startnummer stigende
   *
   * @param {Object} deltager
   */
  #visDeltager(deltager) {
    const tbody = this.#tabellelement.tBodies[0];
    const HTMLTbodyRowsAsArray = Array.from(tbody.rows);
    const dennenummer = deltager.startnummer;
    const indeks = HTMLTbodyRowsAsArray.findIndex((rekke) => {
      const trnummer = Number(rekke.cells[0].textContent);
      return dennenummer < trnummer;
    });

    const newRow = this.#tabellelement.tBodies[0].insertRow(indeks);
    newRow.dataset.startnummer = deltager.startnummer;
    newRow.insertCell(-1).textContent = deltager.startnummer;
    newRow.insertCell(-1).textContent = deltager.navn;
    newRow.insertCell(-1).innerHTML =
      "<td><input type='time' step='1' class='starttid'></td>";
    newRow.insertCell(-1).innerHTML =
      "<td><input type='time' step='1' class='sluttid'></td>";
    newRow.insertCell(-1);
    this.#tabellelement.classList.remove("hidden");
  }

  /**
   * Sjekker om input-parameter startnummer allerede finnes i deltagerlisten
   *
   * @param {number} startnummer
   * @returns {boolean}
   */
  #startnummerFinnes(startnummer) {
    const tbody = this.#tabellelement.tBodies[0];
    const element = tbody.querySelector(
      `tr[data-startnummer="${startnummer}"]`,
    );
    return element !== null;
  }

  /**
   * Hjelpemetode som kan fjernes i endelig løsning.
   * Fyller inn data å arbeide under utvikling av applikasjonen
   */
  #fyllListe() {
    this.#tabellelement.classList.remove("hidden");

    const liste = [
      { startnummer: 567, navn: "Per Persen" },
      { startnummer: 127, navn: "Anne Annesen" },
      { startnummer: 838, navn: "Jo Josen" },
      { startnummer: 57, navn: "Gro Grosen" },
      { startnummer: 9, navn: "Hanne Hannesen" },
      { startnummer: 65, navn: "Jo Josen" },
      { startnummer: 7476, navn: "Mette Metteson" },
    ];

    for (const deltager of liste) {
      if (!this.#startnummerFinnes(deltager.startnummer)) {
        this.#visDeltager(deltager);
      }
    }
  }
}

const formelement = document.forms["nydeltager"];
const tabellelement = document.getElementById("deltagere");
new KonkurranseController(formelement, tabellelement);

class FilterController{
  #tabellelement;
  #filterSpan;
  /**
   * @param{HTMLFormElement}
   * @param{HTMLTableElement}
   */


constructor(filterelement,tabellelement){
  this.#tabellelement = tabellelement;
  this.#filterSpan = filterelement.querySelector("span");

  filterelement.addEventListener("submit", (event) =>
      this.#aktiverFilter(event),);
  filterelement.addEventListener("reset", ()=> this.#tomFilter());
}
/**
*@param{SubmitEvent}
*/

#aktiverFilter(event){
  event.preventDefault();

  const formData = new FormData(event.target);
  const tekst = formData.get("filtertekst");
  const kolonne = Number(formData.get("felt"));

  let regex;
  try{
    regex = new RegExp(tekst);
  } catch{
    this.#filterSpan.textContent = "Ugyldig mønster";
    return;
  }
  for (const rad of this.#tabellelement.tBodies[0].rows){
    const treff = regex.test(rad.cells[kolonne].textContent);
    rad.classList.toggle("hidden", !treff);
  }
  const feltnavn = kolonne === 0 ? "startnummer" : "navn";
  this.#filterSpan.textContent = `Mønster "${tekst}" på felt "${feltnavn}"`
}

#tomFilter(){
  for(const rad of this.#tabellelement.tBodies[0].rows){
    rad.classList.remove("hidden");
  }
  this.#filterSpan.textContent = "Ingen";
}
}
new FilterController(document.forms["filter"],tabellelement);