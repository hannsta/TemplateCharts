

! function(t, n) {
    "object" == typeof exports && "undefined" != typeof module ? n(exports) : "function" == typeof define && define.amd ? define(["exports"], n) : n((t = "undefined" != typeof globalThis ? globalThis : t || self).TemplateApp = t.TemplateApp || {})
}(this, (function(t) {


/*
widget = Widget({
    host: "http://localhost:8000",
    container: "#container",
    widgetId: 1234-1234-1234
})

*/

t.Widget = function(config){
    var host = config.host;
    var container = config.container;
    var widgetId = config.widgetId;
    var widgetProperties;
    var templateid = config.templateId;
    var sourceid = config.sourceId;
    var scripts;
    var parsedTemplate;
    var templateName;
    var metaData;
    var dataset;
    var userDataSources;
    var userTemplates;
    var widgetName='';
    var templateSelect = false;
    if (config.templateSelect){
        templateSelect = true;
    }
    var datasourceSelect = false;
    if (config.datasourceSelect){
        datasourceSelect = true;
    }    
    var datasourcesVisible = false;
    var templatesVisible = false;

    var registeredInputs = [];
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    var csrftoken = getCookie('csrftoken');
    if (!csrftoken){
      fetch(host+'csrf')
      .then(function(){
        console.log("got CSRF")
      }).then(loadOptions())
    }else{
        loadOptions()
    }

function loadOptions(){
    if (widgetId){
        getWidget()
    }else{
        getTemplate()
    }
}   



function getWidget(widgetid){
    fetch(host+'get_widget?widgetid='+widgetid)
    .then(response => response.text())
    .then(data => {
      var templateData = JSON.parse(data)

      if (templateData.error){
        renderMenu();
      }else{
        sourceid = templateData[0].fields.sourceid
        templateid = templateData[0].fields.templateid   
        widgetProperties = templateData[0].fields.widget
        widgetName = templateData[0].fields.name   
        getTemplate(templateid);
      }

    })
}

function getTemplate(){
    console.log("getting template",templateid)
    fetch(host+'get_template?templateid='+templateid)
    .then(response => response.text())
    .then(data => {
      var templateData = JSON.parse(data)
      parsedTemplate = templateData[0].parsed;
      scripts = templateData[0].fields.scripts;
      templateName = templateData[0].fields.name; 
         
    })
    .then(getMetaData(sourceid))
}

function getMetaData(){
    if (sourceid){
        fetch(host+'get_metadata?sourceid='+sourceid)
        .then(response => response.json())
        .then(data => {
          metaData = data
          document.querySelector(container).innerHTML = ""
          renderMenu()
        })
    }else{
        renderMenu()
    }

}
function getDataList(){
    var datasourceContainer = document.getElementById("datasourceListContainer");
    if (datasourcesVisible){
        datasourceContainer.style.display = "none"; 
        datasourceContainer.innerHTML="";
        datasourcesVisible = false       
    }else{
        fetch(host+'get_user_data')
        .then(response => response.json())
        .then(data => {userDataSources = data})
        .then(data => {
            datasourceContainer.style.display = "flex";
            datasourcesVisible = true;            
            DataSourceList(datasourceContainer)
        })
    }

}
function getTemplateList(){
    var templateContainer = document.getElementById("templateListContainer");
    if (templatesVisible){
        templateContainer.style.display = "none"; 
        templateContainer.innerHTML="";
        templatesVisible = false       
    }else{
        fetch(host+'get_templates')
        .then(response => response.json())
        .then(data => {userTemplates = data})
        .then(data => {
            templateContainer.style.display = "flex"; 
            templatesVisible = true       
            TemplateList(templateContainer)    
        })
    }

}

function renderMenu(){

    let selectedContainer = document.querySelector(container)
    var containerDiv = document.createElement("div");
    containerDiv.className = 'verticalContainer'

    var menuOptions = document.createElement("div");
    menuOptions.className = 'templateMenuOptions'

    if (datasourceSelect){
        var dataButton = document.createElement("div");
        dataButton.innerHTML = '<img src="'+host+'icons/database.svg"></img>'
        dataButton.addEventListener("click", getDataList); 
        dataButton.className = 'templateMenuOption'
        menuOptions.appendChild(dataButton);
    }

    if (templateSelect){
        var chartButton = document.createElement("div");
        chartButton.innerHTML = '<img src="'+host+'icons/bar-chart.svg"></img>'
        chartButton.addEventListener("click", getTemplateList); 
        chartButton.className = 'templateMenuOption'
        menuOptions.appendChild(chartButton);
    }

    var saveButton = document.createElement("div");
    saveButton.innerHTML = '<img src="'+host+'icons/save.svg"></img>'
    saveButton.addEventListener("click", saveWidget); 
    saveButton.className = 'templateMenuOption'

    var saveCopyButton = document.createElement("div");
    saveCopyButton.innerHTML = '<img src="'+host+'icons/files.svg"></img>'
    saveCopyButton.addEventListener("click", saveAsCopy); 
    saveCopyButton.className = 'templateMenuOption'

    var runButton = document.createElement("div");
    runButton.innerHTML = '<img src="'+host+'icons/play.svg"></img>'
    runButton.addEventListener("click", runWidget); 
    runButton.className = 'templateMenuOption'

    var widgetNameInput = document.createElement("div");
    widgetNameInput.innerHTML = '<input type="text" value="'+widgetName+'" id="widgetName"></input>'
    widgetNameInput.className = 'templateMenuOption'


    menuOptions.appendChild(saveButton);
    menuOptions.appendChild(saveCopyButton);
    menuOptions.appendChild(runButton);
    menuOptions.appendChild(widgetNameInput);
    containerDiv.appendChild(menuOptions);


    var templateListContainer = document.createElement("div");
    templateListContainer.id = 'templateListContainer'

    var datasourceListContainer = document.createElement("div");
    datasourceListContainer.id = 'datasourceListContainer'

    containerDiv.appendChild(templateListContainer);
    containerDiv.appendChild(datasourceListContainer);


    var horizontalContainer = document.createElement("div");
    horizontalContainer.className = 'horizontalContainer'

    if (parsedTemplate){
        renderTemplateMenu(horizontalContainer, containerDiv, selectedContainer)
    }else{
        containerDiv.appendChild(horizontalContainer);
        selectedContainer.appendChild(containerDiv);
    }

}
function renderTemplateMenu(horizontalContainer, containerDiv, selectedContainer){
    var menu = document.createElement("div");
    menu.className = 'templateMenuContainer'
    if (!parsedTemplate) return;
    console.log("parsed",parsedTemplate) 
    for (var userInput of parsedTemplate){
        if (!userInput.name) continue;

        Title(menu,userInput.name);
        var inputValue;
        if (widgetProperties){
            inputValue = widgetProperties[userInput.name].value;
        }

        if (userInput.type=='String'){
            TextInput(menu,userInput.name, inputValue);
        }
        if (userInput.type=='CategoryColumn'){
            var options = []
            for (var key of Object.keys(metaData)){
                if (metaData[key]=='TEXT'){
                    options.push({value:key,label:key});
                }
            }
            SingleSelect(menu, userInput.name, options, inputValue);
        }
        if (userInput.type=='ValueColumn'){
            var options = []
            for (var key of Object.keys(metaData)){
                if (metaData[key]=='NUMERIC'){
                    options.push({value:key,label:key});
                }
            }
            SingleSelect(menu, userInput.name, options, inputValue);
        }
    }
    horizontalContainer.appendChild(menu);


    var chartDiv = document.createElement("div");
    chartDiv.setAttribute("id","container")
    horizontalContainer.appendChild(chartDiv);

    containerDiv.appendChild(horizontalContainer);
    selectedContainer.appendChild(containerDiv)
 
}
function saveAsCopy(){
    widgetId = undefined;
    saveWidget()
}
function saveWidget(){
    if (!widgetId){
        widgetId = ''
    }
    var csrftoken = getCookie('csrftoken'); 
    var body = JSON.stringify({
      'scripts':scripts,
      'widgetName':widgetName,
      'widget':widgetProperties,
      'sourceid': sourceid,
      'templateid':templateid,
      'widgetid':widgetId
    })
    fetch('save_widget', {
      method: 'POST',
      credentials: 'include',
      mode: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'X-CSRFToken':csrftoken
      },
      body: body
    }).then(response => response.text())
    .then(data => widgetId = data)  
    runWidget()
}

function runWidget(){
    saveProperties()
}

function saveProperties(){
    var propertyCopy = {}
    for (var input of parsedTemplate){
        var value = document.querySelector("[id='"+input.name+"']")
        console.log("found value",value,"#"+input.name)
        propertyCopy[input.name] = {type: input.type, value: value.value};
    }
    widgetProperties = propertyCopy;
    widgetName = document.querySelector('[id="widgetName"]').value
    getDataset()
}

function getDataset(){
    console.log("widgetprops",widgetProperties)
    var csrftoken = getCookie('csrftoken'); 
    var body = JSON.stringify({'properties':widgetProperties, 'metadata':metaData, 'sourceid':sourceid})
    fetch(host+'get_data',{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-CSRFToken':csrftoken
      },
      body:body
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      dataset = data
      processScript()
    })
}
function processScript(){
    var csrftoken = getCookie('csrftoken'); 
    var body = JSON.stringify({'properties':widgetProperties, 'sourceid':sourceid, 'templateid' : templateid})
    fetch(host+'get_script',{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-CSRFToken':csrftoken
      },
      body:body
    })
    .then(response => response.text())
    .then(txt => {
      var dataSet = dataset
      var scriptURLs = scripts.split(/\r?\n/);
      for (var scriptURL of scriptURLs){
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = function(){
        };
        script.src = scriptURL;
        document.getElementsByTagName('head')[0].appendChild(script);
      }
      eval(txt)
    })
  }

function TextInput(element, key, value){
    var inputDiv = document.createElement("div");
    inputDiv.className = "textInput";

    var inputMenu = document.createElement("input");
    inputMenu.setAttribute("type","text");
    inputMenu.setAttribute("id",key);
    inputMenu.setAttribute("value",value)

    inputDiv.appendChild(inputMenu);
    element.appendChild(inputDiv);
}

function Title(element, title){
    var titleDiv = document.createElement("div");
    titleDiv.className = "templateOptionTitle";
    titleDiv.innerHTML = title;
    element.appendChild(titleDiv);

}

function SingleSelect(element, key, options, value){
    var inputDiv = document.createElement("div");
    inputDiv.className = "selectInput";

    var inputMenu = document.createElement("select");
    inputMenu.setAttribute("id",key);
    inputMenu.setAttribute("value",value)

    for (var option of options){
        var selectOption = document.createElement("option");
        selectOption.setAttribute("value",option.value);
        selectOption.innerHTML = option.value;
        inputMenu.appendChild(selectOption);

    }

    inputDiv.appendChild(inputMenu);
    element.appendChild(inputDiv);

}    
function DataSourceList(element){
    for (const dataset of userDataSources){
        var datasourceDiv = document.createElement("div");
        datasourceDiv.className = "datasetIcon";
        datasourceDiv.setAttribute("uuid",dataset.sourceid)
        datasourceDiv.innerHTML = dataset.name;
        datasourceDiv.onclick = selectData;
        element.appendChild(datasourceDiv);
    }
}
function TemplateList(element){
    for (const templateObj of userTemplates){
        var templateDiv = document.createElement("div");
        templateDiv.className = "datasetIcon";
        templateDiv.setAttribute("uuid",templateObj[1])
        templateDiv.innerHTML = templateObj[0];
        templateDiv.onclick = selectTemplate;
        element.appendChild(templateDiv);
    }
}
function TemplateList(element){
    for (const templateObj of userTemplates){
        var templateDiv = document.createElement("div");
        templateDiv.className = "datasetIcon";
        templateDiv.setAttribute("uuid",templateObj[1])
        templateDiv.innerHTML = templateObj[0];
        templateDiv.onclick = selectTemplate;
        element.appendChild(templateDiv);
    }
}
function selectData(e){
    sourceid = e.target.getAttribute("uuid");
    getMetaData(sourceid)
}
function selectTemplate(e){
    templateid = e.target.getAttribute("uuid");
    getTemplate(templateid)
}

}
}))
