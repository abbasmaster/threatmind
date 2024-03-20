/*
Copyright (c) 2021-2024 Filigran SAS

This file is part of the OpenCTI Enterprise Edition ("EE") and is
licensed under the OpenCTI Non-Commercial License (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://github.com/OpenCTI-Platform/opencti/blob/master/LICENSE

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Audit from './audit/Root';
import Alerting from './alerting/Root';
import Configuration from './configuration/Configuration';

const RootActivity = () => {
  return (
    <Routes>
      <Route
        path="/audit"
        element={<Audit />}
      />
      <Route
        path="/configuration"
        element={ <Configuration />}
      />
      <Route
        path="/alerting"
        element={ <Alerting />}
      />
    </Routes>
  );
};

export default RootActivity;
