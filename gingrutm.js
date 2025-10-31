//We need to modify some of the form fields based on the path
const formPage  = window.location.pathname.slice(1,-1); //remove slashes
const urlParams = new URLSearchParams(window.location.search);
var submitText  = "Submit"; //Default
var removeList  = new Object(); //Undesired Fields {'fieldName':'elementType'}
var loadCount   = 0; 
var renderCount = 0;

switch (formPage) {
  case "boarding-offer": 
    submitText = "Book Your Free Night"; 
    removeList = {'returning_customer':'input', 'time':'input', 'comments':'textarea'};
    break;
  case "grooming-offer": 
    submitText = "Book To Get 10% Off";  
    removeList = {'returning_customer':'input', 'duration':'input', 'comments':'textarea'};
    break;
  case "daycare-offer":  
    submitText = "Book My Free Day";     
    removeList = {'returning_customer':'input', 'duration':'input', 'comments':'textarea'};
    break;
  default: //Regular old contact form
    removeList = {'date':'input', 'time':'input', 'duration':'input'};    
}

const utmParameters = { 
  //paramName   : fieldName 
  'utm_source'  : 'utm_source',
  'utm_medium'  : 'utm_medium',
  'utm_campaign': 'utm_campaign',
  'utm_content' : 'utm_content',
  'utm_term'    : 'utm_term',
  'gclid'       : 'gclid'
};

const visibleFileds = {
  //fieldName   : Placeholder
  'first_name'  : 'First Name',
  'last_name'   : 'Last Name',
  'email'       : 'Email Address',
  'cell_phone'  : 'Mobile Number',
  'dog'         : 'Dog Name',
  'cat'         : 'Cat Name',
  'animal_names': 'Pet Name(s)',
  'pet_breed'   : 'Pet Breed(s)',
  'breed'       : 'Pet Breed(s)',
  'time'        : 'Desired Time',
  'duration'    : 'Number of Nights',
};

//Wait for GingrForm to load 
function checkForGingrForm() {
  const GingerForm = document.querySelector('.gingrScope');

  //GingrForm is added dynamically through window.GingrForms.createForm()
  //The constructor function adds a "gingrScope" class to the host element
  //With "gingrScope" we know the form code is added, but not rendered yet!  

  if (GingerForm) { //Has gingerScope class been added?
    const cellPhone = document.querySelector('input[name="cell_phone"]');

    //We wait for GingrForm render by checking for cell_phone field to show up 
    if (cellPhone) { //Has the cellPhone field rendered?
      console.log('Gingr form rendered, capturing UTM parameters.');
      clearInterval(formCheckInterval); //Stop checking for GingrForm
            
      //First lets remove any undesired fields
      console.log('Removing irrelevant fields.');
      for (const iFieldName in removeList) { 
        let QS = ".rfb-item:has("+removeList[iFieldName]+"[name='"+iFieldName+"'])";
        const uselessField = document.querySelector(QS);
        console.debug('Seeking '+QS);
        if (uselessField) {
          //uselessField.remove();
          uselessField.setAttribute("style","display: none;");
          console.debug('Removed '+iFieldName);
        }
      }
      
      //Copy URL's UTM parameters into coresponding fields 
      console.log('Capturing UTM parameters.');

      for (const utmParam in utmParameters) {
        const hiddenFieldName = utmParameters[utmParam];
        const hiddenField = document.querySelector("input[name='"+hiddenFieldName+"']");
        if (hiddenField && urlParams.has(utmParam)) {
          hiddenField.value = urlParams.get(utmParam);
          hiddenField.dataset.utm = "utm-"+urlParams.get(utmParam);
          console.debug(hiddenField.value);
        }
      }
      
      //Add placeholder text since labels are hidden to save space 
      console.log('Adding placeholders to the fields.');

      for (const vFieldName in visibleFileds) {
        const visibleField = document.querySelector("input[name='"+vFieldName+"']");
        console.debug('Looking for '+vFieldName);
        if (visibleField) {
          visibleField.placeholder = visibleFileds[vFieldName];
          console.debug('Replaced with '+visibleField.placeholder);
        }
      }  
      
      let dateField = document.querySelector("input[name='date']");
      if (dateField) {
        dateField.setAttribute("type","date");
        console.debug("Datepicker added.");
      }

      let pageField = document.querySelector("input[name='formpage']");
      if (pageField) {
        pageField.value = formPage;
        console.debug("Page path added.");
      }
      
      let commentField = document.querySelector("textarea[name='comments']");
      if (commentField) {
        commentField.placeholder = "Questions / Comments";
        commentField.setAttribute("rows","5"); 
        console.debug("Comments box updated.");
      }
      
      let GingerSubmit = document.querySelector('a.btn-agree');
      if (GingerSubmit) {
        GingerSubmit.innerHTML = submitText;
        console.debug("Submit button updated.");
      }

      console.log("Gingr form modifications complete.");
    } else { //Wait a bit longer for the form to render
      console.debug('R'+renderCount++);
      if (renderCount > 20) { //Let's not wait all day
        clearInterval(formCheckInterval); // Stop polling
        console.log('Gingr form failed to render! :(');
      }  
    }
  } else { //Wait a bit longer for the form to load
    console.debug('L'+loadCount++);
    if (loadCount > 20) { //Let's not wait all day
      clearInterval(formCheckInterval); // Stop polling
      console.log('Gingr form failed to load! :(');
    }
  }
}

console.log('Waiting for Gingr form to load...');
const formCheckInterval = setInterval(checkForGingrForm, 100); //Check every 100ms
