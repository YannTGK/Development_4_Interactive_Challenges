var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
        var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
        var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

        let rightAnswer = new SpeechSynthesisUtterance("You are right!");
        rightAnswer.lang = "en-US";
        rightAnswer.pitch = 1;
        rightAnswer.rate = 1;

        let wrongAnswer = new SpeechSynthesisUtterance("You are wrong");
        wrongAnswer.lang = "en-US";
        wrongAnswer.pitch = 1;
        wrongAnswer.rate = 1;

        const synth = window.speechSynthesis;

        var originalPhrases = [
            'What is the most used boys name in the world?',
            'What is the best phone software in the world?',
            'Yann is the coolest guy from IMD, true or false?'
        ];

        var originalAnswers = [
            "muhammad",
            "apple",
            "true"
        ];

        var phrases = originalPhrases.slice(); 
        var answers = originalAnswers.slice();

        var phrasePara = document.querySelector('.phrase');
        var resultPara = document.querySelector('.result');
        var diagnosticPara = document.querySelector('.output');

        var testBtn = document.querySelector('button');

        var askedQuestions = []; 

        function randomPhrase() {
            var number = Math.floor(Math.random() * phrases.length);
            return number;
        }

        function testSpeech() {
            testBtn.disabled = true;
            testBtn.textContent = 'Test in progress';

            var randomNumber = randomPhrase();
            var phrase = phrases[randomNumber];
            var answer = answers[randomNumber];

            // Remove the question and answer from the arrays to prevent repetition
            phrases.splice(randomNumber, 1);
            answers.splice(randomNumber, 1);

            if (phrases.length === 0) {
                // If all questions have been asked, reset the arrays
                phrases = originalPhrases.slice();
                answers = originalAnswers.slice();
            }

            phrasePara.textContent = phrase;
            resultPara.textContent = 'Your answer?';
            resultPara.style.background = 'rgba(0,0,0,0.2)';
            diagnosticPara.textContent = '...diagnostic messages';

            var phraseText = phrasePara.textContent;
            let utterance = new SpeechSynthesisUtterance(phraseText);
            utterance.lang = "en-US";
            utterance.pitch = 1;
            utterance.rate = 1;

            utterance.onend = function() {
                var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrase +';';
                var recognition = new SpeechRecognition();
                var speechRecognitionList = new SpeechGrammarList();
                speechRecognitionList.addFromString(grammar, 1);
                recognition.grammars = speechRecognitionList;
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.start();

                recognition.onresult = function(event) {
                    var speechResult = event.results[0][0].transcript.toLowerCase();
                    diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
                    if(speechResult.includes(answer)) {
                        resultPara.textContent = 'That is the right answer';
                        resultPara.style.background = 'lime';
                        synth.speak(rightAnswer);

                    } else {
                        resultPara.textContent = 'Wrong answer or didnt heard that correctly';
                        resultPara.style.background = 'red';
                        synth.speak(wrongAnswer);
                    }

                    console.log('Confidence: ' + event.results[0][0].confidence);
                }

                recognition.onspeechend = function() {
                    recognition.stop();
                    testBtn.disabled = false;
                    testBtn.textContent = 'New question';
                }

                recognition.onerror = function(event) {
                    testBtn.disabled = false;
                    testBtn.textContent = 'New question';
                    diagnosticPara.textContent = 'Error occurred in recognition: ' + event.error;
                }
            }

            synth.speak(utterance);
        }

        testBtn.addEventListener('click', testSpeech);