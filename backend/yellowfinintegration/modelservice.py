

from yellowfinintegration.models import Widget


def getWidgetProperties(widgetid,user, properties):
    widgets = Widget.objects.filter(user=user, widgetid=widgetid) 
    widget = widgets.first()
    if (widget):
        widget = widget.widget

        for key in widget:
            if (widget[key]['hidden']):
                properties[key]= {'type': widget[key]['type'],'value': widget[key]['value']} 
    return properties