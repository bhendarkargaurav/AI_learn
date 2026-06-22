
import record from "node-record-lpcm16";
import speech from "@google-cloud/speech";

const client = new speech.SpeechClient();

console.log("Speak Something...");

const request = {
  config: {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "en-US",
  },
};

const recognizeStream = client
  .streamingRecognize(request)
  .on("data", (data) => {
    const text =
      data.results[0]?.alternatives[0]?.transcript;

    console.log("You Said:", text);
    process.exit(0);
  })
  .on("error", console.error);

record
  .record({
    sampleRateHertz: 16000,
    silence: "2.0",
  })
  .stream()
  .pipe(recognizeStream);








// import speech_recognition as sr 

// def main();

// r = sr.Recognizer()  // sspeech to text

// with se.microphone() as source:  //mic access
// r.adjust_for_ambient_noise(source)
// r.pause_threshould = 2;

// print("speek Something...")
// audio = r.listen(source)

// print("Processing Audio... (STT)")
// stt = r.recognize_google(audio)

// print("YOU Said", stt)

// main()