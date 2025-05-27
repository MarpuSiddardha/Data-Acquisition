import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  Paper
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ReportLayouts from '@/pages/reports/layouts/ReportLayouts';
import ManualReports from '@/pages/reports/manual/ManualReports';
import AutomatedReports from '@/pages/reports/automated/AutomatedReports';
import { TabPanelProps } from '@/utils/types';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function ReportsAnalytics() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = React.useMemo(() => [
    {
      label: 'Layouts',
      path: '/reports-analytics/layouts',
      component: <ReportLayouts />,
    },
    {
      label: 'Manual Reports',
      path: '/reports-analytics/manual',
      component: <ManualReports />,
    },
    {
      label: 'Automated Reports',
      path: '/reports-analytics/automated',
      component: <AutomatedReports />,
    },
  ], []);

  useEffect(() => {
    const currentTab = tabs.findIndex(tab => location.pathname.startsWith(tab.path));
    if (currentTab !== -1) {
      setActiveTab(currentTab);
    }
  }, [location.pathname, tabs]);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    navigate(tabs[newValue].path);
  };

  return (
    <Box>
      <Paper>
        <AppBar position='static' elevation={0} sx={{ bgcolor: 'transparent' }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            textColor='primary'
            variant='fullWidth'
            aria-label='full width tabs example'
            sx={{
              minHeight: '30px',
              fontFamily: 'Poppins',
              color:'#1e3a8a',
              '& .MuiTabs-indicator': {
                display: 'none',
              },
              '& .MuiTab-root': {
                backgroundColor: 'white',
                color: '#1e3a8a',
                padding: '8px 16px',
                minHeight: '30px',
                border: '2px solid transparent',
                textTransform: 'none',
                '&:not(:last-of-type)': {
                  borderRight: '3px solid #ddd',
                },
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
              },
              '& .MuiTab-root.Mui-selected': {
                color: 'white',
                backgroundColor: '#1E3A8A',
                borderBottom: '#1E3A8A',
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} {...a11yProps(index)} />
            ))}
          </Tabs>
        </AppBar>
      </Paper>

      <Box>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}