/*
Copyright (c) 2021-2023 Filigran SAS

This file is part of the OpenCTI Enterprise Edition ("EE") and is
licensed under the OpenCTI Non-Commercial License (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://github.com/OpenCTI-Platform/opencti/blob/master/LICENSE

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import React from 'react';
import { Route, useParams } from 'react-router-dom';
import { graphql } from 'react-relay';
import { QueryRenderer } from '../../../../relay/environment';
import Playbook from './Playbook';
import Loader from '../../../../components/Loader';
import ErrorNotFound from '../../../../components/ErrorNotFound';

const playbookQuery = graphql`
  query RootPlaybookQuery($id: String!) {
    playbook(id: $id) {
      id
      ...Playbook_playbook
    }
    playbookComponents {
      id
      name
      description
      is_entry_point
      is_internal
      configuration_schema
      ports {
        id
        type
      }
    }
  }
`;

const RootPlaybook = () => {
  const { playbookId } = useParams();
  return (
    <QueryRenderer
      query={playbookQuery}
      variables={{ id: playbookId }}
      render={({ props }) => {
        if (props) {
          if (props.playbook && props.playbookComponents) {
            return (
              <>
                <Route
                  exact
                  path="/dashboard/data/processing/automation/:playbookId"
                  render={(routeProps) => (
                    <Playbook
                      {...routeProps}
                      playbook={props.playbook}
                      playbookComponents={props.playbookComponents}
                    />
                  )}
                />
              </>
            );
          }
          return <ErrorNotFound />;
        }
        return <Loader />;
      }}
    />
  );
};

export default RootPlaybook;
