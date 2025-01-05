const dictionaryApiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const translateApiUrl = "https://api.mymemory.translated.net/get";

let lastSearchedWord = " ";

async function searchWords() {
  const wordInput = document.getElementById("wordinput");
  const languageSelect = document.getElementById("languageSelect");
  const resultDiv = document.getElementById("result");
  const word = wordInput.value.trim();
  const targetLanguage = languageSelect.value;

  if (!word) {
    resultDiv.textContent = "Please enter a word or sentance";
    return;
  }

  if (word !== lastSearchedWord) {
    lastSearchedWord = word;
    resultDiv.textContent = "searching...";

    try {
      const translateResponse = await fetch(
        `${translateApiUrl}?q=${encodeURIComponent(
          word
        )}&langpair=en|${targetLanguage}`
      );
      if (!translateResponse.ok) {
        throw new Error(`HTTP error! Status:${translateResponse.status}`);
      }
      const translateData = await translateResponse.json();

      // Get english defination
      const dictionaryResponse = await fetch(
        dictionaryApiUrl + encodeURIComponent(word)
      );

      let dictionaryData = [];

      if (dictionaryResponse.ok) {
        dictionaryData = await dictionaryResponse.json();
      }
      let result = `word/phases:${word}\n;`;
      result += `Translation (${getLanguagename(targetLanguage)}): ${
        translateData.responseData.translatedText
      }\n\n`;

      if (
        dictionaryData &&
        dictionaryData.length > 0 &&
        dictionaryData[0].meanings
      ) {
        dictionaryData[0].meanings.forEach((meaning, index) => {
          result += `Meaning ${index + 1} (${meaning.partOfSpeech});\n`;
          meaning.definitions.forEach((def, defIndex) => {
            result += `${defIndex + 1}. ${def.definition}\n`;
            if (def.example) {
              result += `Example: ${def.example}\n`;
            }
          });
          result += "\n";
        });
      } else {
        result += "No additional definitions found for this word.\n";
      }

      resultDiv.textContent = result;
    } catch (error) {
      console.error("Error:", error);
      resultDiv.textContent = `An error occured: ${error.message}`;
    }
  } else {
    location.reload();
  }

  function getLanguagename(code) {
    const lan = {
      en: "English",
      hi: "Hindi",
      es: "Spanish",
      de: "German",
      fr: "French",
      ja: "Japanese",
      ko: "Korean",
    };

    return lan[code] || code;
  }
}

function toggleSpeechRecognition() {
    const model = document.getElementById('speechModel');
    model.style.display = 'flex';

    // start speech recognition process

    startSpeechRecognition();

}
// function to close speech recognise model
function closeSpeechModel(){
    const model = document.getElementById('speechModel');
    model.style.display='none';
}

function startSpeechRecognition(){
    const selectedLan = document.getElementById('languageSelect').value;

    const recognition = new webkitSpeechRecognition();

    recognition.lang = selectedLan;
    recognition.interimResults = false;

    recognition.onresult = function(event){
        const result= event.results[0][0].transcript;
        document.getElementById('wordinput').value = result;
        closeSpeechModel();
    }
    recognition.onerror = function(event){
        console.error('speech recognise error:',event.error);
        closeSpeechModel
    }
    recognition.onend = function(){
        console.log('Speech recognise ended.')
    }
    recognition.start();
}
