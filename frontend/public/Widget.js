

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
    var role = config.role;
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
    var sourceFilters;
    var userDataSources;
    var userTemplates;
    var widgetName='';
    var sourceFilterProperties;
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



function getWidget(){
    fetch(host+'get_widget?widgetid='+widgetId+'&role='+role)
    .then(response => response.text())
    .then(data => {
      var templateData = JSON.parse(data)

      if (templateData.error){
        renderMenu();
      }else{
        sourceid = templateData.sourceid
        templateid = templateData.templateid   
        widgetProperties = templateData.widget
        widgetName = templateData.name   
        getTemplate(templateid);
      }

    })
}

function getTemplate(){
    console.log("getting template",templateid)
    fetch(host+'get_template?templateid='+templateid+'&role='+role+'&widgetid='+widgetId)
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
          getFilters()
        })
    }else{
        renderMenu()
    }

}
function getFilters(){
    fetch(host+'get_source_filters?sourceid='+sourceid)
    .then(response => response.json())
    .then(data => {
        sourceFilters = data
        document.querySelector(container).innerHTML = ""
        renderMenu()
    }) 
}
function getDataList(){
    var datasourceContainer = document.getElementById("datasourceListContainer");

    var datasourceTitle = document.createElement("div");
    datasourceTitle.className = 'listContainerTitle'
    datasourceTitle.innerHTML = 'Select Datasource'
    datasourceContainer.appendChild(datasourceTitle);

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
            DataSourceList(datasourceContainer,sourceid)
        })
    }

}
function getTemplateList(){
    var templateContainer = document.getElementById("templateListContainer");
    
    var templateTitle = document.createElement("div");
    templateTitle.className = 'listContainerTitle'
    templateTitle.innerHTML = 'Select Template'
    templateContainer.appendChild(templateTitle);

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
            TemplateList(templateContainer, templateid)    
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
        dataButton.innerHTML = DataSourceIcon()
        dataButton.addEventListener("click", getDataList); 
        dataButton.className = 'templateMenuOption'
        menuOptions.appendChild(dataButton);
        var dataLabel = document.createElement("div");
        dataLabel.innerHTML = 'Data'
        dataLabel.addEventListener("click", getDataList); 
        dataLabel.className = 'templateMenuOptionLabel'
        menuOptions.appendChild(dataLabel);
   
    }

    if (templateSelect){
        var chartButton = document.createElement("div");
        chartButton.innerHTML = TemplateIcon();
        chartButton.addEventListener("click", getTemplateList); 
        chartButton.className = 'templateMenuOption'
        menuOptions.appendChild(chartButton);
        var chartLabel = document.createElement("div");
        chartLabel.innerHTML = 'Viz'
        chartLabel.addEventListener("click", getTemplateList); 
        chartLabel.className = 'templateMenuOptionLabel'
        menuOptions.appendChild(chartLabel);
    }

    var saveButton = document.createElement("div");
    saveButton.innerHTML = SaveIcon();
    saveButton.addEventListener("click", saveWidget); 
    saveButton.className = 'templateMenuOption'
    menuOptions.appendChild(saveButton);

    var saveLabel = document.createElement("div");
    saveLabel.innerHTML = 'Save'
    saveLabel.addEventListener("click", getDataList); 
    saveLabel.className = 'templateMenuOptionLabel'
    menuOptions.appendChild(saveLabel);

    var saveCopyButton = document.createElement("div");
    saveCopyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -2 24 24" width="24" fill="currentColor"><path d="M6 15H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3h3l3 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3zm0-2V7a2 2 0 0 1 2-2h2V2H2v11h4zm8.172-6H8v11h8V8.828L14.172 7z"></path></svg>'
    saveCopyButton.addEventListener("click", saveAsCopy); 
    saveCopyButton.className = 'templateMenuOption'
    menuOptions.appendChild(saveCopyButton);

    var saveCopyLabel = document.createElement("div");
    saveCopyLabel.innerHTML = 'Copy'
    saveCopyLabel.addEventListener("click", getDataList); 
    saveCopyLabel.className = 'templateMenuOptionLabel'
    menuOptions.appendChild(saveCopyLabel);

    var runButton = document.createElement("div");
    runButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -3 24 24" width="24" fill="currentColor"><path d="M13.82 9.523a.976.976 0 0 0-.324-1.363L3.574 2.128a1.031 1.031 0 0 0-.535-.149c-.56 0-1.013.443-1.013.99V15.03c0 .185.053.366.153.523.296.464.92.606 1.395.317l9.922-6.031c.131-.08.243-.189.325-.317zm.746 1.997l-9.921 6.031c-1.425.867-3.3.44-4.186-.951A2.918 2.918 0 0 1 0 15.03V2.97C0 1.329 1.36 0 3.04 0c.567 0 1.123.155 1.605.448l9.921 6.032c1.425.866 1.862 2.696.975 4.088-.246.386-.58.712-.975.952z"></path></svg>'
    runButton.addEventListener("click", runWidget); 
    runButton.className = 'templateMenuOption'
    menuOptions.appendChild(runButton);

    var runLabel = document.createElement("div");
    runLabel.innerHTML = 'Run'
    runLabel.addEventListener("click", runWidget); 
    runLabel.className = 'templateMenuOptionLabel'
    menuOptions.appendChild(runLabel);

    var widgetNameInput = document.createElement("div");
    widgetNameInput.innerHTML = '<input type="text" value="'+widgetName+'" id="widgetName"></input>'
    widgetNameInput.className = 'templateMenuOption'
    menuOptions.appendChild(widgetNameInput);


    containerDiv.appendChild(menuOptions);


    var templateListContainer = document.createElement("div");
    templateListContainer.id = 'templateListContainer'

    var datasourceListContainer = document.createElement("div");
    datasourceListContainer.id = 'datasourceListContainer'

    containerDiv.appendChild(templateListContainer);
    containerDiv.appendChild(datasourceListContainer);


    var renderContainer = document.createElement("div");
    renderContainer.className = 'renderContainer'

    if (parsedTemplate){
        renderTemplateMenu(renderContainer, containerDiv, selectedContainer)
    }else{
        var chartDiv = document.createElement("div");
        chartDiv.setAttribute("id","container")
        renderContainer.appendChild(chartDiv);
        containerDiv.appendChild(renderContainer);
        selectedContainer.appendChild(containerDiv);
        runWidget();
    }

}
function renderTemplateMenu(renderContainer, containerDiv, selectedContainer){
    
    var menu = document.createElement("div");

    menu.className = 'templateMenuContainer'
    if (!parsedTemplate) return;
    console.log("parsed",parsedTemplate) 
    for (var userInput of parsedTemplate){
        var item = document.createElement("div");
        item.className = 'templateMenuItem'
        if (!userInput.name) continue;

        if (userInput.type=='SubMenu'){
            LargeTitle(menu,userInput.name);
        }else{
            Title(menu,userInput.name);
        }

        var inputValue;
        var hidden = false;
        if (widgetProperties && widgetProperties[userInput.name]){
            inputValue = widgetProperties[userInput.name].value;
            if (Array.isArray(inputValue) && userInput.type!='ColumnList'){
                inputValue = inputValue[0]
            }
            hidden = widgetProperties[userInput.name].hidden;
        }

        console.log("metadata",metaData)

        if (userInput.type=='String'){
            TextInput(item,userInput.name, inputValue);
        }

        if (userInput.type=='MultiSelect'){
            SingleSelect(item, userInput.name, userInput.parameters.split(","), inputValue);
        }
        if (userInput.type=='CategoryColumn'){
            var options = []
            for (var key of Object.keys(metaData)){
                if (metaData[key]=='TEXT'){
                    options.push({value:key,label:key});
                }
            }
            item.appendChild(ColumnSearch(userInput.name, {},1));
        }
        if (userInput.type=='ValueColumn'){
            var options = []
            for (var key of Object.keys(metaData)){
                if (metaData[key]=='NUMERIC'){
                    options.push({value:key,label:key});
                }
            }
            item.appendChild(ColumnSearch(userInput.name, {},1));
            //SingleSelect(item, userInput.name, options, inputValue);
        }
        if (userInput.type=='ColumnList' || userInput.type=='ColumnListRecords'){
            var options = []
            for (var key of Object.keys(metaData)){
                options.push({value:key,label:key});
            }
            menu.appendChild(ColumnSearch(userInput.name, {},0));
            //MultiSelect(item, userInput.name, options, inputValue);
        }

        if (role=='WRITE'){
            HiddenToggle(item, userInput.name,hidden);
        }
        menu.appendChild(item)
    }
    LargeTitle(menu,"Source Filters")
    for (var sourceFilter of sourceFilters){
        Title(menu,sourceFilter.key);
        TextInput(menu,sourceFilter.key, sourceFilter.value);
    }

    //menu.appendChild(ColumnSearch("test", {}));


    renderContainer.appendChild(menu);



    var chartDiv = document.createElement("div");
    chartDiv.setAttribute("id","container")
    renderContainer.appendChild(chartDiv);

    containerDiv.appendChild(renderContainer);
    selectedContainer.appendChild(containerDiv)
    runWidget()
}
function saveAsCopy(){
    widgetId = undefined;
    saveWidget()
}
function saveWidget(){
    saveProperties(true)
}
function writeWidget(){
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
    var chartDiv = document.getElementById("container")
    chartDiv.innerHTML=""
    if (!templateid){
        var templateMessage = document.createElement("div");
        templateMessage.setAttribute("class","messagePlaceholder")
        templateMessage.innerHTML = "Select a Template "
        chartDiv.appendChild(templateMessage);        
    }else if (!sourceid){
        var datasetMessage = document.createElement("div");
        datasetMessage.setAttribute("class","messagePlaceholder")
        datasetMessage.innerHTML = "Select a Dataset "
        chartDiv.appendChild(datasetMessage);    
    }else{
        saveProperties()
        chartDiv.innerHTML = '<div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>' 
    }
}

function saveProperties(saveAction=false){
    var propertyCopy = {};
    for (var input of parsedTemplate){
        if (input.type == 'SubMenu'){ continue };
        var value = document.querySelector("[id='"+input.name+"']");
        var hidden = document.querySelector("[hiddenid='"+input.name+"']");
        var isHidden = false;
        if (hidden){
            isHidden = (hidden.getAttribute("visible") === 'false');
        }
        var selectedValue = value;
        if (value.value){
            selectedValue = value.value
        }
        if (value.getSelected){
            selectedValue = []
            var selectedCols = value.getSelected();
            for (var key of Object.keys(selectedCols)){
                selectedValue.push(key)   
            }
        }
        if (value.selectedOptions){
            selectedValue=[]
            for (var option of value.selectedOptions){
                selectedValue.push(option.value)
            }
        }
        
        propertyCopy[input.name] = {type: input.type, value: selectedValue, hidden:isHidden};
    }
    widgetProperties = propertyCopy;
    var sourceFilterPropertyCopy = {};
    for (var sourceFilter of sourceFilters){
        var value = document.querySelector("[id='"+sourceFilter.key+"']")
        sourceFilterPropertyCopy[sourceFilter.key] = value.value;
    }
    sourceFilterProperties = sourceFilterPropertyCopy
    widgetName = document.querySelector('[id="widgetName"]').value
    if (saveAction){
        writeWidget()
    }else{
        getDataset()
    }
}

function getDataset(){
    console.log("widgetprops",widgetProperties)
    var csrftoken = getCookie('csrftoken'); 
    var body = JSON.stringify({'properties':widgetProperties, 'metadata':metaData, 'sourceid':sourceid, 'sourceFilterProperties':sourceFilterProperties, 'widgetid':widgetId})
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
      dataset = data
      processScript()
    })
}
function processScript(){

    var csrftoken = getCookie('csrftoken'); 
    var body = JSON.stringify({'properties':widgetProperties, 'sourceid':sourceid, 'templateid' : templateid, 'widgetid':widgetId})
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
      var chartDiv = document.getElementById("container")
      chartDiv.innerHTML=""
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

function LargeTitle(element, title){
    var titleDiv = document.createElement("div");
    titleDiv.className = "templateOptionLargeTitle";
    titleDiv.innerHTML = title;
    element.appendChild(titleDiv);
}
function SingleSelect(element, key, options, defaultValue){
    var inputDiv = document.createElement("div");
    inputDiv.className = "selectInput";

    var inputMenu = document.createElement("select");
    inputMenu.setAttribute("id",key);

    for (var option of options){
        var selectOption = document.createElement("option");
        var value = option
        if (option.value){
            value = option.value
        }
        selectOption.setAttribute("value",value);
        if (defaultValue==value){
            selectOption.setAttribute("selected",'selected');
        }
        selectOption.innerHTML = value;
        inputMenu.appendChild(selectOption);

    }

    inputDiv.appendChild(inputMenu);
    element.appendChild(inputDiv);

}    
function MultiSelect(element, key, options, value){
    var inputDiv = document.createElement("div");
    inputDiv.className = "selectInput";
    var inputMenu = document.createElement("select");
    inputMenu.setAttribute("id",key);
    inputMenu.setAttribute("multiple","multiple")
    inputMenu.setAttribute("value",value)

    for (var option of options){
        var selectOption = document.createElement("option");
        selectOption.setAttribute("value",option.value);
        selectOption.innerHTML = option.value;
        inputMenu.appendChild(selectOption);

    }
    inputDiv.appendChild(inputMenu);
    element.appendChild(inputDiv);
    var secondElement = new Choices(inputMenu, { allowSearch: true, removeItems: true, removeItemButton: true });

}  
function DataSourceList(element,sourceid){
    for (const dataset of userDataSources){
        var datasourceDiv = document.createElement("div");
        datasourceDiv.className = "datasetIcon";
        if (sourceid == dataset.sourceid){
            datasourceDiv.classList.add("selectedColumn")
        }
        datasourceDiv.setAttribute("uuid",dataset.sourceid)
        datasourceDiv.innerHTML = dataset.name;
        datasourceDiv.onclick = selectData;
        element.appendChild(datasourceDiv);
    }
}
function TemplateList(element,templateid){
    for (const templateObj of userTemplates){
        var templateDiv = document.createElement("div");
        templateDiv.className = "datasetIcon";
        if (templateid == templateObj[1]){
            templateDiv.classList.add("selectedColumn")
        }
        templateDiv.setAttribute("uuid",templateObj[1])
        templateDiv.innerHTML = templateObj[0];
        templateDiv.onclick = selectTemplate;
        element.appendChild(templateDiv);
    }
}

function HiddenToggle(element, key, isHidden){
    var hiddenToggle = document.createElement("div");
    hiddenToggle.className = 'itemHiddenToggle'; 
    if (isHidden){
        hiddenToggle.innerHTML = eyeClose();
    }else{
        hiddenToggle.innerHTML = eyeOpen();
    }
    hiddenToggle.onclick = toggleHidden;
    hiddenToggle.setAttribute("hiddenid",key)
    hiddenToggle.setAttribute("visible","true")
    element.appendChild(hiddenToggle);
}



function Column(name, type, agg, selection, handleToggle, handleAggChange){
    var column = document.createElement("div");
    column.className = "columnSelector";
    column.setAttribute("key",name)
    function handleClick(){
        handleToggle(name)
    }
    function handleAggSelect(e){
        handleAggChange(name,e.target.value)
    }
    if (selection){
        column.classList.add('selectedColumn')
    }

    
    var iconDiv = document.createElement("div");
    iconDiv.className="columnIcon"
    var columnTitle = document.createElement("div");
    columnTitle.innerHTML='<div class="columnTitle">'+name+'</div>'

    if (handleClick){
        iconDiv.onclick = handleClick;
        columnTitle.onclick = handleClick;
    }

    var aggSelect = document.createElement("select");
    var numericAggs = ['DISTINCT COUNT','COUNT']
    aggSelect.className='columnAgg'
    if (type=='NUMERIC'){
        column.classList.add('metric')
        iconDiv.innerHTML = HashIcon();
        aggSelect.innerHTML = `
            <option value="SUM">∑</option>
            <option value="MAX">+</option>
            <option value="MIN">-</option>
            <option value="COUNT">#</option>
            <option value="DISTINCT COUNT">!#</option>
            <option value="NONE"></option>
        `;
    }else if (type=='TEXT'){
        if (numericAggs.includes(agg)){
            column.classList.add('metric')
            iconDiv.innerHTML = HashIcon();
        }else{
            column.classList.add('dimension')
            iconDiv.innerHTML = TextIcon();
        }
        aggSelect.innerHTML = `
            <option value="NONE"></option>
            <option value="COUNT">#</option>
            <option value="DISTINCT COUNT">#!</option>
        `;
    }
    aggSelect.onchange = handleAggSelect;
    aggSelect.value = agg;
    column.appendChild(iconDiv);
    column.appendChild(columnTitle)
    if (selection){
        column.appendChild(aggSelect);

    }
    return column;
}

function ColumnSearch(key, currentSelected, limit){

    var selected = currentSelected;
    var currentSearch = ''

    function toggleSelection(element){
        if (Object.keys(selected).includes(element)){
            delete selected[element];
            if (Object.keys(selected).length==0){
                toggleSearchVisible();            
            }
        }else{
            selected[element]={'agg':'DEFAULT'}
            if (limit>0 && Object.keys(selected).length==limit){
                toggleSearchVisible();
            }
        }
        renderColumns();
        selectedCount.innerHTML = Object.keys(selected).length+" Selected"
    }
    function handleAggChange(key,agg){
        selected[key]={'agg':agg}
        renderColumns();
    }
    function getSelected(){
        return selected;
    }
    function handleSearchInput(e){
        currentSearch = e.target.value
        renderColumns();
    }
    function renderColumns(){
        columnSelector.innerHTML = ''
        ColumnSelector(columnSelector, toggleSelection, currentSearch, selected,false, handleAggChange)
        selectedColumns.innerHTML = ''
        ColumnSelector(selectedColumns, toggleSelection, currentSearch, selected,true, handleAggChange)
    }
    function toggleSearchVisible(){
        (columnSearchPopup.style.display=='none') ? columnSearchPopup.style.display='flex' : columnSearchPopup.style.display='none';
        (clickContainer.style.display=='none') ? clickContainer.style.display='flex' : clickContainer.style.display='none';
    }


    var columnSearch = document.createElement("div");
    columnSearch.className = "columnSearchContainer";
    columnSearch.id = key;
    columnSearch.getSelected = getSelected;

    var selectedCount = document.createElement("div");
    selectedCount.className = "columnSelectedCount";
    selectedCount.innerHTML = Object.keys(selected).length+" Selected"
    selectedCount.onclick = toggleSearchVisible;
    columnSearch.appendChild(selectedCount)



    var selectedColumns = document.createElement("div");
    selectedColumns.className = "columnSelectorContainer";
    ColumnSelector(selectedColumns, toggleSelection, '', selected, true, handleAggChange)
    columnSearch.appendChild(selectedColumns)

    var clickContainer = document.createElement("div");
    clickContainer.className = "clickContainer";
    clickContainer.onclick = toggleSearchVisible;

    var columnSearchPopup = document.createElement("div");
    columnSearchPopup.className = "columnSearchPopup";

    var columnSearchInput = document.createElement("input");
    columnSearchInput.className = "columnSearchInput";
    columnSearchInput.onchange = handleSearchInput;
    columnSearchPopup.appendChild(columnSearchInput)

    var columnSelector = document.createElement("div");
    columnSelector.className = "columnSelectorContainer";
    ColumnSelector(columnSelector, toggleSelection, '', selected, false, handleAggChange)
    columnSearchPopup.appendChild(columnSelector)

    columnSearch.appendChild(clickContainer)

    columnSearch.appendChild(columnSearchPopup)
    

    return columnSearch;

}

function ColumnSelector(colContainer, toggleSelection,filter,selected, isSelection, handleAggChange){
    for (var key of Object.keys(metaData)){
        var isSelected =  Object.keys(selected).includes(key);
        if ((isSelection && !isSelected) || (!isSelection && isSelected)){
            continue;
        }
        var agg = 'Default'
        if (isSelected){
            agg = selected[key]['agg']
        }
        if (key.includes(filter)){
            var colObj = Column(key, metaData[key], agg,  isSelected, toggleSelection, handleAggChange)
            colContainer.appendChild(colObj);
        }
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

function toggleHidden(e){
    if (e.currentTarget.getAttribute("visible")=="true"){
        e.currentTarget.innerHTML = eyeClose();
        e.currentTarget.setAttribute("visible","false")
    }else{
        e.currentTarget.innerHTML = eyeOpen();
        e.currentTarget.setAttribute("visible","true")
    }
}

function eyeOpen(){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -6 24 24" width="24" fill="currentColor"><path d="M18 6c0-1.81-3.76-3.985-8.007-4C5.775 1.985 2 4.178 2 6c0 1.825 3.754 4.006 7.997 4C14.252 9.994 18 7.82 18 6zm-8 6c-5.042.007-10-2.686-10-6S4.984-.017 10 0c5.016.017 10 2.686 10 6s-4.958 5.993-10 6zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></svg>'
}
function eyeClose(){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor"><path d="M15.398 7.23l1.472-1.472C18.749 6.842 20 8.34 20 10c0 3.314-4.958 5.993-10 6a14.734 14.734 0 0 1-3.053-.32l1.747-1.746c.426.044.862.067 1.303.066h.002c-.415 0-.815-.063-1.191-.18l1.981-1.982c.47-.202.847-.579 1.05-1.049l1.98-1.981A4 4 0 0 1 10.022 14C14.267 13.985 18 11.816 18 10c0-.943-1.022-1.986-2.602-2.77zm-9.302 3.645A4 4 0 0 1 9.993 6C5.775 5.985 2 8.178 2 10c0 .896.904 1.877 2.327 2.644L2.869 14.1C1.134 13.028 0 11.585 0 10c0-3.314 4.984-6.017 10-6 .914.003 1.827.094 2.709.262l-1.777 1.776c-.29-.022-.584-.035-.88-.038.282.004.557.037.823.096l-4.78 4.779zM19.092.707a1 1 0 0 1 0 1.414l-16.97 16.97a1 1 0 1 1-1.415-1.413L17.677.708a1 1 0 0 1 1.415 0z"></path></svg>';
}
function TextIcon(){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 24 24" width="24" fill="currentColor"><path d="M12,1 L12,3 C12,3.55228475 11.5522847,4 11,4 C10.4477153,4 10,3.55228475 10,3 L10,2 L7,2 L7,10 L8,10 C8.55228475,10 9,10.4477153 9,11 C9,11.5522847 8.55228475,12 8,12 L4,12 C3.44771525,12 3,11.5522847 3,11 C3,10.4477153 3.44771525,10 4,10 L5,10 L5,2 L2,2 L2,3 C2,3.55228475 1.55228475,4 1,4 C0.44771525,4 0,3.55228475 0,3 L0,1 C0,0.44771525 0.44771525,0 1,0 L11,0 C11.5522847,0 12,0.44771525 12,1 Z"></path></svg>';
}
function HashIcon(){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 24 24" width="24" fill="currentColor"><path d="M6 6v2h2V6H6zm0-2h2V1a1 1 0 1 1 2 0v3h3a1 1 0 0 1 0 2h-3v2h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3H6v3a1 1 0 0 1-2 0v-3H1a1 1 0 1 1 0-2h3V6H1a1 1 0 1 1 0-2h3V1a1 1 0 1 1 2 0v3z"></path></svg>';
}
function DataSourceIcon(){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor"><path d="M3 12a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H3zm0-2a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3 3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3zm0-8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3zm2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path></svg>'
}
function TemplateIcon(){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -4 24 24" width="24" fill="currentColor"><path d="M1 0a1 1 0 0 1 1 1v14a1 1 0 0 1-2 0V1a1 1 0 0 1 1-1zm12 4a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zM7 8a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z"></path></svg>'
}
function SaveIcon(){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 24 24" width="24" fill="currentColor"><path d="M2 0h11.22a2 2 0 0 1 1.345.52l2.78 2.527A2 2 0 0 1 18 4.527V16a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 2v14h14V4.527L13.22 2H2zm4 8h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm0 2v4h6v-4H6zm7-9a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1zM5 3h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 3h3V5H6v1z"></path></svg>';
}
}
}))
