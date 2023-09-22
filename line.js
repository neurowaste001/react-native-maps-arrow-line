import React, { useMemo, useContext } from "react";
import { Polyline, Marker } from "react-native-maps";
import DefaultArrow from "./default";
import calculateRotation from './calc';
import headingContext from './context';

const ArrowedPolyline = ({arrow = null, addOnlyLastArrow = false, arrowColor=null, arrowSize = 8, ...polylineProps}) => {
  const {
    coordinates = [],
    geodesic = false,
    strokeColor = 'black',
    strokeColors = [] // not working on Google Maps for lines
  } = polylineProps;

  const heading = useContext(headingContext);
  const markerData = useMemo(() => {
     if(addOnlyLastArrow){
       const index = coordinates.length - 1;
       return [calculateRotation(coordinates[index], coordinates[index - 1], geodesic, heading.heading)]
      }
     const zoom = Math.floor(heading.zoom);
     const sampling = zoom<=5?610:zoom<=6?377:zoom<=7?233:zoom<=8?144:zoom<=9?89:zoom<=10?55:zoom<=11?34:zoom===12?21:zoom===13?13:zoom===14?8:zoom===15?5:zoom===16?3:1;
     const delta = 360*Math.exp(-zoom*Math.LN2)*2;
     const inScreen = (coord)=> heading?.center?.latitude+delta>coord.latitude && heading?.center?.latitude-delta<coord.latitude && heading?.center?.longitude+delta>coord.longitude && heading?.center?.longitude-delta<coord.longitude;
     const result = coordinates.reduce((acc, coord, index) => {if (index%sampling===0 && inScreen(coord)){acc.push(calculateRotation(coord, coordinates[index - 1], geodesic, heading.heading))}; return acc}, []);
     // first item will be empty as we don't place marker at the line start
     result.shift();
     return result;
    }, [coordinates, geodesic, addOnlyLastArrow, heading]);

  if (coordinates.length < 2) { return null; }
  return (
    <>
      <Polyline coordinates={coordinates} {...polylineProps}/>
      {markerData.map((markerProps, index) => {
        const Component = typeof arrow === 'function' ? arrow : DefaultArrow;
        const color = arrowColor || strokeColors[index % strokeColors.length] || strokeColor;
        return (
          <Marker {...markerProps} tappable={false} anchor={{ y: -0.01 }} tracksViewChanges={false} centerOffset={{y: -0.01}}>
            <Component color={color} size={arrowSize}   />
          </Marker>
        );
      })}
    </>
  )
};

export default ArrowedPolyline;
