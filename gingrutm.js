//We need to modify some of the form fields based on the path
const formPage = window.location.pathname.slice(1,-1); //remove slashes
const urlArgs  = new URLSearchParams(window.location.search);
var submitText = "Submit"; //Default
var removeList = new Object(); //Undesired Fields {'fieldName':'elementType'}

switch (formPage) {
  case "boarding-offer": 
    submitText = "Book Your Free Night"; 
    removeList = {'returning_customer':'input', 'comments':'textarea', 'time':'input'};
    break;
  case "grooming-offer": 
    submitText = "Book To Get 10% Off";  
    removeList = {'returning_customer':'input', 'comments':'textarea', 'duration':'input'};
    break;
  case "daycare-offer":  
    submitText = "Book My Free Day";     
    removeList = {'returning_customer':'input', 'comments':'textarea', 'duration':'input'};
    break;
  default: //All other contact forms
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
  'animal_names': 'Pet Name(s)',
  'pet_breed'   : 'Pet Breed(s)',
  'date'        : 'Desired Date',
  'time'        : 'Desired Time',
  'duration'    : 'Number of Nights',
};

//-----------------------------------------------------------------------------
function gingrFormReady(formHash) {  
  //GingrForm is added dynamically through window.GingrForms.createForm()
  //The constructor function adds a "gingrScope" class to the host element
  //With "gingrScope" we know the form code is added, but not rendered yet,  
  //so wait for GingrForm render by checking for cell_phone field to show up.
  const cellPhone = document.querySelector('.form'+formHash+' input[name="cell_phone"]');

  if (cellPhone) { //Has the cellPhone field rendered?
    console.log('Gingr form #'+formHash+' rendered.');
          
    //First lets hide the undesired fields
    console.debug('Hiding irrelevant fields on form #'+formHash);
    for (const iFieldName in removeList) { 
      let QS = '.form'+formHash+" .rfb-item:has("+removeList[iFieldName]+"[name='"+iFieldName+"'])";
      const uselessField = document.querySelector(QS);
      console.debug('Seeking '+QS);
      if (uselessField) {
        uselessField.setAttribute("style","display: none;");
        console.debug('Removed '+iFieldName+' on form #'+formHash);
      }
    }
    
    //Copy URL's UTM parameters into coresponding fields 
    console.debug('Capturing UTM parameters on form #'+formHash);

    for (const utmParam in utmParameters) {
      const hiddenFieldName = utmParameters[utmParam];
      const hiddenField = document.querySelector('.form'+formHash+" input[name='"+hiddenFieldName+"']");
      if (hiddenField && urlArgs.has(utmParam)) {
        hiddenField.value = urlArgs.get(utmParam);
        hiddenField.dataset.utm = "utm-"+urlArgs.get(utmParam);
        console.debug(hiddenField.value);
      }
    }
    
    //Add placeholder text since labels are hidden to save space 
    console.debug('Adding placeholders to the fields on form #'+formHash);

    for (const vFieldName in visibleFileds) {
      const visibleField = document.querySelector('.form'+formHash+" input[name='"+vFieldName+"']");
      console.debug('Looking for '+vFieldName+' on form #'+formHash);
      if (visibleField) {
        visibleField.placeholder = visibleFileds[vFieldName];
        console.debug('Palceholder '+visibleField.placeholder+' added on form #'+formHash);
      }
    }  
    
    let dateField = document.querySelector('.form'+formHash+" input[name='date']");
    if (dateField) { //Switch on datepicker on focus to allow placeholder to show
      dateField.onfocus = function() { dateField.setAttribute("type","date"); }
      dateField.onblur  = function() { dateField.setAttribute("type","text"); }
      console.debug("Datepicker added on form #"+formHash);
    }

    let pageField = document.querySelector('.form'+formHash+" input[name='formpage']");
    if (pageField) {
      pageField.value = formPage;
      console.debug("Page path added on form #"+formHash);
    }
    
    let commentField = document.querySelector('.form'+formHash+" textarea[name='comments']");
    if (commentField) {
      commentField.placeholder = "Questions / Comments";
      commentField.setAttribute("rows","5"); 
      console.debug("Comments box updated on form #"+formHash);
    }
    
    let GingerSubmit = document.querySelector('.form'+formHash+' a.btn-agree');
    if (GingerSubmit) {
      GingerSubmit.innerHTML = submitText;
      console.debug("Submit button updated on form #"+formHash);
    }

    console.log("Gingr form #"+formHash+" modifications complete.");
    return true;
  } else { //Wait a bit longer for the form to render
    return false;
  }
}

function modifyGingr(formHash = '12345') {
  console.log('Waiting for Gingr form #'+formHash+' to render');
  let count = 1;
  const intervalId = setInterval(function() {
    if (gingrFormReady(formHash)) {
      clearInterval(intervalId);
      return true;
    } else { //Give it another try
      count++;
      console.debug('Form #'+formHash+' wait attempt '+count);
      if (count >= 20) { //Give up
        console.log('Gingr form #'+formHash+' failed to render! :(');
        clearInterval(intervalId); 
        return false;
      }
    }
  }, 100);
}

function uniqueID(n = 7) { return (Math.random() + 1).toString(36).substring(n); }

function addGingr(domain = 'demo', thankyou = '', formName = 'lead_form') {
  //First create a unique gingrID to set the multple form apart
  const formHash = uniqueID();
  const gingrID  = "gingr-"+formHash;
  const currentSpot = document.currentScript.parentElement;
  const gingrHouse  = currentSpot.appendChild(document.createElement("div"));
  gingrHouse.setAttribute("id",    gingrID );
  gingrHouse.setAttribute("class", "form"+formHash);

  let gingrFormConfiguation = new Object();

  if (thankyou) {
    gingrFormConfiguation = {
      submit_callback: function() { 
        location.href = thankyou; 
      }, 
      form_name: formName,
      subdomain: domain,
      target: '#'+gingrID
    }
  } else {
    gingrFormConfiguation = {
      form_name: formName,
      subdomain: domain,
      target: '#'+gingrID
    }
  }
  
  console.log('Creating new Gingr Form #'+formHash);
  console.debug(gingrFormConfiguation);
  window.GingrForms.createForm(gingrFormConfiguation);
  modifyGingr(formHash);
}
