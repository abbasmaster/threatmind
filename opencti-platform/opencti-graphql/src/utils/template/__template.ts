// text //
import type { Template } from '../../generated/graphql';
import { templateIncidentResponse } from './__incidentCase.template';

// templates //

const templateText: Template = {
  name: 'template with simple text',
  id: 'templateText-id',
  content: '<div>\n'
    + '<h1> Main title </h1>\n'
    + '<p> Some content </p>\n'
    + '<h2> Subtitle 2 </h2>\n'
    + '<h3> Subtitle 3 </h3>\n'
    + '<p> A paragraph content </p> \n'
    + '</div> \n'
    + '</html>',
  template_widgets_names: [],
};

const templateAttribute: Template = {
  name: 'template with attributes',
  id: 'templateAttribute-id',
  content: `<div>
    <h1> Main title </h1>
    <p> Report name: $containerName</p>
    <p> This report has been published $reportPublicationDate, and has labels: $containerLabels</p>
    </div>
    </html>`,
  template_widgets_names: ['containerName', 'reportPublicationDate', 'containerLabels', 'widgetReportMultiAttributes'],
};

const templateList: Template = {
  name: 'template list: list of locations contained in the report',
  id: 'templateList-id',
  content: '<div>\n'
    + '<h1> Main title </h1>\n'
    + '<p> Locations contained in the report: $locationsList</p>\n'
    + '</div> \n'
    + '</html>',
  template_widgets_names: ['locationsList'],
};

const templateGraph: Template = {
  name: 'template graph (donut)',
  id: 'templateGraph-id',
  template_widgets_names: ['widgetGraph'],
  content: `
  <div style="width: 600px">
    <h1>Template graph</h1>
    <div>$widgetGraph</div>
  </div>
  `,
};

export const usedTemplatesByEntityType = {
  Report: [templateText, templateAttribute, templateList, templateGraph],
  Grouping: [templateText, templateGraph],
  'Case-Incident': [templateIncidentResponse],
};
